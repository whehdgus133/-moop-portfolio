#!/usr/bin/env python3
"""Create web images and register a draft. Source files are never modified."""
import argparse
import hashlib
import io
import json
import re
import shutil
import tempfile
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SUPPORTED = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'}


def export_photo(source, destination, stem, relative_dir, photo_id, order):
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        profile = original.info.get('icc_profile')
        if profile:
            # Convert tagged Adobe RGB / Display P3 photographs to web sRGB.
            image = ImageCms.profileToProfile(
                image, ImageCms.ImageCmsProfile(io.BytesIO(profile)),
                ImageCms.createProfile('sRGB'), outputMode='RGB',
            )
        else:
            image = image.convert('RGB')
        sources = []
        variants = {}
        for label, long_edge, quality in [('thumb', 640, 85), ('preview', 1600, 88), ('full', 2800, 90)]:
            variant = image.copy()
            variant.thumbnail((long_edge, long_edge), Image.Resampling.LANCZOS)
            filename = f'{stem}-{label}.webp'
            # Do not carry camera/GPS metadata into publicly served images.
            variant.info.clear()
            variant.save(destination / filename, 'WEBP', quality=quality, method=6)
            variants[label] = f'{relative_dir}/{filename}'
            if not any(item['width'] == variant.width for item in sources):
                sources.append({'src': variants[label], 'width': variant.width})
        return {
            'id': photo_id, 'alt': '', 'caption': '', 'order': order,
            'width': image.width, 'height': image.height,
            'src': variants['preview'], 'thumbnail': variants['thumb'],
            'full': variants['full'], 'sources': sources,
            'source': {'filename': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()},
        }


def main():
    parser = argparse.ArgumentParser(description='원본을 보존하고 웹용 이미지와 초안 프로젝트를 만듭니다.')
    parser.add_argument('source', type=Path, help='원본 사진 폴더')
    parser.add_argument('--id', required=True, help='고유 영문 ID. 예: artist-portrait-2026')
    parser.add_argument('--name', required=True, help='화면에 표시할 프로젝트 이름')
    parser.add_argument('--category', required=True, choices=['portrait', 'product', 'event'])
    parser.add_argument('--year', default='')
    parser.add_argument('--client', default='')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.id):
        parser.error('ID에는 영문 소문자, 숫자, 단어 사이 하이픈만 사용할 수 있습니다.')
    if not args.source.is_dir():
        parser.error('원본 사진 폴더가 없습니다.')
    sources = sorted(path for path in args.source.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED)
    if not sources:
        parser.error('JPG, PNG, WebP 또는 TIFF 사진을 찾지 못했습니다.')
    manifest = ROOT / 'data/projects.json'
    data = json.loads(manifest.read_text())
    destination = ROOT / 'images/projects' / args.id
    if destination.exists() or any(project['id'] == args.id for project in data['projects']):
        parser.error('이미 사용 중인 ID입니다. 기존 프로젝트와 사진은 덮어쓰지 않습니다.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix='.prepare-', dir=destination.parent))
    try:
        photos = [export_photo(source, staging, f'{index:02d}', f'images/projects/{args.id}', f'{args.id}-{index:02d}', index)
                  for index, source in enumerate(sources, 1)]
        project = {
            'id': args.id, 'name': args.name, 'client': args.client,
            'category': args.category, 'medium': 'Photography', 'year': args.year,
            'description': '', 'status': 'draft', 'isSample': False,
            'order': max((item['order'] for item in data['projects']), default=0) + 10,
            'coverId': photos[0]['id'], 'coverPosition': '50% 50%', 'images': photos,
        }
        # Re-read before registration so a concurrent edit is never silently overwritten.
        latest = json.loads(manifest.read_text())
        if latest != data:
            raise RuntimeError('작업 중 프로젝트 목록이 변경되었습니다. 다시 실행해 주세요.')
        data['projects'].append(project)
        staged_manifest = staging / 'projects.json'
        staged_manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        staging.rename(destination)
        (destination / 'projects.json').replace(manifest)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    print(f'{len(photos)}장의 웹용 사진과 초안을 생성했습니다: {args.id}')
    print('data/projects.json에서 설명·사진 설명·대표 사진을 확인하고 status를 published로 바꾸면 공개됩니다.')


if __name__ == '__main__':
    main()
