# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class EmolItem(scrapy.Item):
    newspaper=scrapy.Field()
    content=scrapy.Field()

class LaTerceraItem(scrapy.Item):
    newspaper=scrapy.Field()
    content=scrapy.Field()
