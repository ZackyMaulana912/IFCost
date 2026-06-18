from __future__ import annotations
import ifcopenshell
import ifcopenshell.util.element as ele_util
from typing import Any


def safe_round(val: Any, digits: int = 3) -> float | None:
    try:
        return round(float(val), digits)
    except (TypeError, ValueError):
        return None


def get_pset_value(element, pset_name: str, prop_name: str) -> Any:
    try:
        psets = ifcopenshell.util.element.get_psets(element)
        pset = psets.get(pset_name, {})
        return pset.get(prop_name)
    except Exception:
        return None


def find_qto_value(element, prop_name: str) -> Any:
    """Cari nilai QTO dari semua pset yang namanya mengandung 'qto' atau 'quantity'.
    Menangkap QTO_CLASSIFICATION pada file Smiley-West (IFC2X3, ArchiCAD)."""
    try:
        psets = ifcopenshell.util.element.get_psets(element, qtos_only=False)
        for pset_name, props in psets.items():
            if "qto" in pset_name.lower() or "quantity" in pset_name.lower():
                if prop_name in props:
                    return props[prop_name]
        # Fallback: cari tanpa filter
        for pset_name, props in psets.items():
            if prop_name in props:
                return props[prop_name]
    except Exception:
        pass
    return None


def get_wall_types(model) -> list:
    walls = list(model.by_type("IfcWall")) + list(model.by_type("IfcWallStandardCase"))
    seen = set()
    unique = []
    for w in walls:
        if w.GlobalId not in seen:
            seen.add(w.GlobalId)
            unique.append(w)
    return unique


def extract_walls(model) -> list[dict]:
    results = []
    for wall in get_wall_types(model):
        try:
            length = safe_round(find_qto_value(wall, "Length"))
            height = safe_round(find_qto_value(wall, "Height"))
            net_side_area = safe_round(find_qto_value(wall, "NetSideArea"))
            net_volume = safe_round(find_qto_value(wall, "NetVolume"))
            gross_volume = safe_round(find_qto_value(wall, "GrossVolume"))

            # Fallback dari geometri jika QTO kosong
            if net_volume is None and length and height:
                thickness = safe_round(find_qto_value(wall, "Width")) or 0.2
                net_volume = safe_round((length or 0) * (height or 0) * thickness)

            results.append({
                "GlobalId": wall.GlobalId,
                "Name": wall.Name or "",
                "Type": wall.is_a(),
                "Length": length,
                "Height": height,
                "NetSideArea": net_side_area,
                "NetVolume": net_volume,
                "GrossVolume": gross_volume,
            })
        except Exception:
            continue
    return results


def extract_slabs(model) -> list[dict]:
    results = []
    for slab in model.by_type("IfcSlab"):
        try:
            gross_area = safe_round(find_qto_value(slab, "GrossArea"))
            net_area = safe_round(find_qto_value(slab, "NetArea"))
            volume = safe_round(find_qto_value(slab, "NetVolume")) or safe_round(find_qto_value(slab, "GrossVolume"))

            predefined = getattr(slab, "PredefinedType", None)
            if predefined and hasattr(predefined, "is_a"):
                predefined = str(predefined)

            results.append({
                "GlobalId": slab.GlobalId,
                "Name": slab.Name or "",
                "PredefinedType": str(predefined) if predefined else None,
                "GrossArea": gross_area,
                "NetArea": net_area,
                "Volume": volume,
            })
        except Exception:
            continue
    return results


def extract_columns(model) -> list[dict]:
    results = []
    for col in model.by_type("IfcColumn"):
        try:
            length = safe_round(find_qto_value(col, "Length"))
            cross_section = safe_round(find_qto_value(col, "CrossSectionArea"))
            volume = safe_round(find_qto_value(col, "NetVolume")) or safe_round(find_qto_value(col, "GrossVolume"))

            if volume is None and length and cross_section:
                volume = safe_round(length * cross_section)

            results.append({
                "GlobalId": col.GlobalId,
                "Name": col.Name or "",
                "Length": length,
                "CrossSectionArea": cross_section,
                "Volume": volume,
            })
        except Exception:
            continue
    return results


def extract_beams(model) -> list[dict]:
    results = []
    for beam in model.by_type("IfcBeam"):
        try:
            length = safe_round(find_qto_value(beam, "Length"))
            cross_section = safe_round(find_qto_value(beam, "CrossSectionArea"))
            volume = safe_round(find_qto_value(beam, "NetVolume")) or safe_round(find_qto_value(beam, "GrossVolume"))

            if volume is None and length and cross_section:
                volume = safe_round(length * cross_section)

            results.append({
                "GlobalId": beam.GlobalId,
                "Name": beam.Name or "",
                "Length": length,
                "CrossSectionArea": cross_section,
                "Volume": volume,
            })
        except Exception:
            continue
    return results


def extract_spaces(model) -> list[dict]:
    results = []
    for space in model.by_type("IfcSpace"):
        try:
            # 5 lapis fallback untuk floor area
            floor_area = (
                find_qto_value(space, "NetFloorArea")
                or find_qto_value(space, "GrossFloorArea")
                or find_qto_value(space, "FloorArea")
                or find_qto_value(space, "NetArea")
                or find_qto_value(space, "GrossArea")
            )
            height = (
                find_qto_value(space, "Height")
                or find_qto_value(space, "NetHeight")
                or find_qto_value(space, "FinishCeilingHeight")
            )

            room_name = space.Name or space.LongName or space.GlobalId

            results.append({
                "GlobalId": space.GlobalId,
                "RoomName": str(room_name),
                "FloorArea": safe_round(floor_area),
                "Height": safe_round(height),
            })
        except Exception:
            continue
    return results


def compute_totals(walls: list, slabs: list, columns: list, beams: list, spaces: list) -> dict:
    wall_volume = sum(w["NetVolume"] or 0 for w in walls)
    wall_area = sum(w["NetSideArea"] or 0 for w in walls)
    slab_area = sum(s["NetArea"] or s["GrossArea"] or 0 for s in slabs)
    column_volume = sum(c["Volume"] or 0 for c in columns)
    beam_volume = sum(b["Volume"] or 0 for b in beams)

    # floor area: dari IfcSpace lebih akurat dari pada slab
    floor_area_space = sum(sp["FloorArea"] or 0 for sp in spaces)
    floor_area = floor_area_space if floor_area_space > 0 else slab_area

    return {
        "wall_volume": round(wall_volume, 3),
        "wall_area": round(wall_area, 3),
        "slab_area": round(slab_area, 3),
        "column_volume": round(column_volume, 3),
        "beam_volume": round(beam_volume, 3),
        "floor_area": round(floor_area, 3),
    }


def parse_ifc(file_bytes: bytes) -> dict:
    import tempfile, os

    with tempfile.NamedTemporaryFile(suffix=".ifc", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        model = ifcopenshell.open(tmp_path)
        schema = model.schema

        # Summary count per type
        summary = {}
        for entity_type in [
            "IfcWall", "IfcWallStandardCase", "IfcSlab",
            "IfcColumn", "IfcBeam", "IfcSpace", "IfcWindow", "IfcDoor",
        ]:
            count = len(model.by_type(entity_type))
            if count > 0:
                summary[entity_type] = count

        walls = extract_walls(model)
        slabs = extract_slabs(model)
        columns = extract_columns(model)
        beams = extract_beams(model)
        spaces = extract_spaces(model)
        totals = compute_totals(walls, slabs, columns, beams, spaces)

        return {
            "schema": schema,
            "summary": summary,
            "qto": {
                "walls": walls,
                "slabs": slabs,
                "columns": columns,
                "beams": beams,
            },
            "spaces": spaces,
            "totals": totals,
        }
    finally:
        os.unlink(tmp_path)
