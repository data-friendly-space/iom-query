from readability.readability import Document, Unparseable
import html2text
import json
import logging
import sys
from os.path import join


logger = logging.getLogger(__name__)

text_maker = html2text.HTML2Text()
text_maker.ignore_anchor = True
text_maker.ignore_link = True  # there's either anchor or link but the documentation is confusing
text_maker.ignore_images = True
text_maker.ignore_tables = True
text_maker.ignore_emphasis = True


def process(doc):
    html_body = Document(doc)

    summary = html_body.summary()
    title = html_body.short_title()

    text = text_maker.handle(summary)
    return title, text


def run(data_file, retriever_output_dir, output_file):
    extract = []
    with open(data_file, 'r') as fp:
        data = json.load(fp)
    total = len(data)
    for index, item in enumerate(data):
        file = join(retriever_output_dir, f"{item['id']}-{item['webId']}.html")
        print(f'\t - ({index + 1}/{total}) {file}')
        try:
            with open(file, 'rb') as html_file:
                html_file_text = html_file.read().decode(
                    'utf-8',
                    errors='ignore',
                )
                title, text = process(html_file_text)
        except (Unparseable, FileNotFoundError):
            title, text = None, None
        extract.append({
            **item,
            'title': title,
            'text': text,
        })
    with open(output_file, 'w') as fp:
        data = json.dump(extract, fp)


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print('Please pass data-file, retriever-output-directory, output-file')
        exit(1)
    run(sys.argv[1], sys.argv[2], sys.argv[3])
