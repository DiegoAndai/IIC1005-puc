import scrapy
from tarea2crawler.items import EmolItem

class EmolSpider(scrapy.Spider):
    name = "emol"
    allowed_domains = ["emol.com"]
    start_urls = [
        "http://www.emol.com",
        "http://www.emol.com/nacional",
        "http://www.emol.com/educacion",
        "http://www.emol.com/deportes",
        "http://www.emol.com/deportes/futbol",
        "http://www.emol.com/deportes/tenis",
        "http://www.emol.com/deportes/otrosdeportes",
        "http://www.emol.com/deportes/motores",
        "http://www.emol.com/internacional",
        "http://www.emol.com/tecnologia",
        "http://www.emol.com/economia",
        "http://www.emol.com/tag/emprendedores/309/todas.aspx",
        "http://www.emol.com/economia/noticias",
        "http://www.emol.com/espectaculos",
        "http://www.emol.com/espectaculos/cine",
        "http://www.emol.com/espectaculos/television",
        "http://www.emol.com/espectaculos/musica",
        "http://www.emol.com/tendencias/"
        #poner tantos urls debe ser la manera mas arcaica de hacer esto pero no he logrado hacerlo de otra forma
    ]

    def parse(self, response):
        for href in response.xpath('//a[contains(@href, "noticias")]/@href'):
             url = response.urljoin(href.extract())
             yield scrapy.Request(url, callback=self.parse_dir_contents)


    def parse_dir_contents(self, response):
        content=response.xpath('//div[@id="cuDetalle_cuTexto_textoNoticia"]/text()').extract()
        content=''.join(content)
        for text in response.xpath('//div[@id="cuDetalle_cuTexto_textoNoticia"]/div').extract():
            if ('"' in text) and ('class=' not in text) and ('style=' not in text):
                content+=text
        if content!='':
            item=EmolItem()
            item['content']=content
            item['newspaper']='Emol'
            yield item
