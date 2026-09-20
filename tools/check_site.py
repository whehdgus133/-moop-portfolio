#!/usr/bin/env python3
"""Check project data and referenced images before publishing (no dependencies)."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
errors = []
notes = []


def require(condition, message):
    if not condition:
        errors.append(message)


def local_file(value, label):
    if not isinstance(value, str) or not value:
        errors.append(f'{label}: 파일 경로가 비어 있습니다.')
        return
    parsed = urlparse(value)
    target = (ROOT / value).resolve()
    require(not parsed.scheme and not value.startswith('/') and ROOT in target.parents, f'{label}: 상대경로를 사용해 주세요.')
    require(target.is_file(), f'{label}: 파일을 찾지 못했습니다: {value}')


def check_photo(photo, label):
    require(isinstance(photo.get('width'), int) and photo.get('width', 0) > 0, f'{label}: width는 양의 정수여야 합니다.')
    require(isinstance(photo.get('height'), int) and photo.get('height', 0) > 0, f'{label}: height는 양의 정수여야 합니다.')
    for key in ('src', 'thumbnail', 'full'):
        if key == 'src' or photo.get(key):
            local_file(photo.get(key), f'{label}/{key}')
    widths = set()
    for source in photo.get('sources', []):
        local_file(source.get('src'), f'{label}/sources')
        width = source.get('width')
        require(isinstance(width, int) and width > 0 and width not in widths, f'{label}: sources의 width는 중복 없는 양의 정수여야 합니다.')
        widths.add(width)
    if not photo.get('alt'):
        notes.append(f'{label}: 사진 설명(alt)을 입력하면 접근성과 검색에 도움이 됩니다.')


def main():
    data = json.loads((ROOT / 'data/projects.json').read_text())
    site = json.loads((ROOT / 'data/site.json').read_text())
    require(data.get('schemaVersion') == 1 and site.get('schemaVersion') == 1, 'schemaVersion은 1이어야 합니다.')
    categories = {item['id'] for item in data['categories']}
    require(len(categories) == len(data['categories']), '카테고리 ID가 중복되었습니다.')
    for category in data['categories']:
        if category.get('cover'):
            check_photo(category['cover'], f'category/{category["id"]}')
    ids = set()
    for project in data['projects']:
        key = project.get('id', '')
        require(bool(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', key)), f'{key}: 프로젝트 ID 형식이 잘못되었습니다.')
        require(key not in ids, f'{key}: 프로젝트 ID가 중복되었습니다.')
        ids.add(key)
        require(bool(project.get('name')), f'{key}: 프로젝트 이름이 필요합니다.')
        require(project.get('category') in categories, f'{key}: 존재하지 않는 카테고리입니다.')
        require(project.get('status') in ('draft', 'published'), f'{key}: status는 draft 또는 published여야 합니다.')
        require(isinstance(project.get('order'), (int, float)), f'{key}: order는 숫자여야 합니다.')
        photo_ids = set()
        for photo in project['images']:
            require(bool(photo.get('id')) and photo['id'] not in photo_ids, f'{key}: 사진 ID가 없거나 중복되었습니다.')
            photo_ids.add(photo.get('id'))
            require(isinstance(photo.get('order'), (int, float)), f'{key}: 사진 order는 숫자여야 합니다.')
            check_photo(photo, f'{key}/{photo.get("id")}')
        if photo_ids or project.get('status') == 'published':
            require(project.get('coverId') in photo_ids, f'{key}: coverId와 일치하는 사진이 없습니다.')
    for field in ('hero', 'aboutPhoto'):
        if site.get(field):
            check_photo(site[field], field)
    about = site.get('about', {})
    for field in ('shootCount', 'clientCount'):
        count = about.get(field, '')
        require(not count or bool(re.fullmatch(r'[0-9]{1,8}\+?', str(count))), f'{field}: 숫자 또는 숫자+ 형식으로 입력해 주세요.')
    for client in about.get('clients', []):
        require(bool(client.get('name', '').strip()), '클라이언트 이름을 입력해 주세요.')
        if client.get('logo'):
            check_photo(client['logo'], f'client/{client.get("id", "")}')
    for career in about.get('career', []):
        require(bool(career.get('title', '').strip()), '경력 제목을 입력해 주세요.')
    for field in ('instagram', 'youtube', 'film'):
        link = site['links'].get(field)
        require(not link or (urlparse(link).scheme == 'https' and bool(urlparse(link).netloc)), f'{field}: https 주소를 입력해 주세요.')
    email = site['links'].get('email')
    require(not email or bool(re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email)), 'email: 이메일 주소만 입력해 주세요.')
    endpoint = site.get('contact', {}).get('formEndpoint', '')
    require(not endpoint or bool(re.fullmatch(r'https://formspree\.io/f/[a-zA-Z0-9]+', endpoint)), 'formEndpoint: 발급된 Formspree 폼 주소를 입력해 주세요.')
    faq = site.get('contact', {}).get('faq', [])
    require(isinstance(faq, list) and len(faq) <= 12, 'Q&A는 최대 12개까지 입력해 주세요.')
    faq_ids = set()
    for item in faq:
        require(bool(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', item.get('id', ''))) and item.get('id') not in faq_ids, 'Q&A 질문 ID가 없거나 중복되었습니다.')
        faq_ids.add(item.get('id'))
        for field, limit in (('question', 100), ('answer', 1000)):
            value = item.get(field)
            require(isinstance(value, str) and bool(value.strip()) and len(value) <= limit, f'Q&A {field}: 내용을 확인해 주세요.')
    for note in notes:
        print('참고:', note)
    for error in errors:
        print('오류:', error)
    if errors:
        raise SystemExit(1)
    print(f'검사 통과: 프로젝트 {len(ids)}개, 이미지 경로와 데이터 형식 정상.')


if __name__ == '__main__':
    try:
        main()
    except (KeyError, TypeError, ValueError) as error:
        raise SystemExit(f'데이터 형식을 확인해 주세요: {error}')
