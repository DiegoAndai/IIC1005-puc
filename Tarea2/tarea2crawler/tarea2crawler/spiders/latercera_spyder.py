import scrapy
from tarea2crawler.items import LaTerceraItem

class LaTerceraSpider(scrapy.Spider):
    name = "latercera"
    allowed_domains = ["latercera.com"]
    start_urls = [
        "http://www.latercera.com/",
        "http://www.latercera.com/canal/nacional/680.html",
        "http://www.latercera.com/canal/mundo/678.html",
        "http://www.latercera.com/canal/politica/674.html",
        "http://www.latercera.com/canal/negocios/655.html",
        "http://www.latercera.com/canal/tendencias/659.html",
        "http://www.latercera.com/canal/cultura/1453.html",
        "http://www.latercera.com/canal/entretencion/661.html",
        "http://www.latercera.com/canal/deportes/656.html"
    ]

    def parse(self, response):
        for href in  response.xpath('//a[contains(@href,"noticia")]/@href'):
             url = response.urljoin(href.extract())
             yield scrapy.Request(url, callback=self.parse_dir_contents)


    def parse_dir_contents(self, response):
        content=''
        for text in response.xpath('//div[contains(@class,"article-center-text")]/p').extract():
            if ('"' in text) and ('class=' not in text) and ('style=' not in text):
                content+=text
        if content!='':
            item=LaTerceraItem()
            item['content']=content
            item['newspaper']='La Tercera'
            yield item
