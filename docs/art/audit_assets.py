"""Read-only inventory of supplied ZIP members and the GitHub M3 baseline.

Requires Pillow. Run with --baseline pointing to the pinned game's checkout.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from zipfile import ZipFile

from PIL import Image


def digest(data):
    return hashlib.sha256(data).hexdigest()


def inspect(path, data):
    record = {"path": str(path), "bytes": len(data), "sha256": digest(data)}
    if str(path).lower().endswith(".png"):
        try:
            with Image.open(io.BytesIO(data)) as png:
                if png.format != "PNG":
                    raise ValueError("File extension does not match PNG format")
                alpha = png.convert("RGBA").getchannel("A")
                histogram = alpha.histogram()
                record.update(
                    size=list(png.size),
                    mode=png.mode,
                    alpha_channel="A" in png.getbands() or "transparency" in png.info,
                    alpha_range=list(alpha.getextrema()),
                    transparent=histogram[0],
                    partial=sum(histogram[1:255]),
                    opaque=histogram[255],
                    bbox_alpha_32=alpha.point(lambda value: 255 if value >= 32 else 0).getbbox(),
                )
        except (OSError, ValueError) as error:
            record["decode_error"] = str(error)
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", required=True, type=Path)
    parser.add_argument("archives", nargs="*", type=Path)
    args = parser.parse_args()
    public = args.baseline / "public"
    manifest = json.loads((public / "assets/portraits/manifest.v1.json").read_text())
    records = []
    for file in sorted((public / "assets/anime").rglob("*")):
        if file.is_file():
            records.append(inspect(file.relative_to(public).as_posix(), file.read_bytes()))
    by_path = {record["path"]: record for record in records}
    for asset_id, asset in manifest["assets"].items():
        if asset["path"] in by_path:
            record = by_path[asset["path"]]
            record["manifest_asset_id"] = asset_id
            record["manifest_sha_matches"] = asset.get("sha256") == record["sha256"]
    by_sha = {}
    for record in records:
        by_sha.setdefault(record["sha256"], []).append(record["path"])

    archives = []
    for path in args.archives:
        data = path.read_bytes()
        archive = {"name": path.name, "bytes": len(data), "sha256": digest(data), "members": []}
        with ZipFile(io.BytesIO(data)) as source:
            for entry in source.infolist():
                if entry.is_dir():
                    continue
                member = inspect(entry.filename, source.read(entry))
                member["baseline_exact_paths"] = by_sha.get(member["sha256"], [])
                archive["members"].append(member)
        archives.append(archive)
    print(json.dumps({"baseline": records, "archives": archives}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
