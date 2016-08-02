import json
import csv
import unicodedata
from random import randint

#funciona un poco distinto para python 2 y 3:
#python 2:  exporta bien los tildes y eñes con el .encode('utf-8')
#python 3:  exporta strings como bytes de la forma: b'string', además codifica tildes y eñes, por ejemplo:
#           á=\xc3\xa1

def toFecha(ano,mes,dia):#normaliza el formato de las fechas para que, por ejemplo, uno sea '01' y no '1'
    ano_str=str(ano)
    if mes<10:
        mes_str='0'+str(mes)
    else:
        mes_str=str(mes)
    if dia<10:
        dia_str='0'+str(dia)
    else:
        dia_str=str(dia)
    fecha_str=dia_str+'/'+mes_str+'/'+ano_str
    return fecha_str

with open('tarea1.json') as data_file:
    decode=json.load(data_file)

for expedicion_dctry in decode['expediciones']:#crea las fechas, este for recorre todas las expediciones
    cumbres_list=expedicion_dctry['cumbres']
    cumbre_ano=randint(2013,2015)#para la emulacion se supone que las expediciones ocurrieron dentro de un mismo año
    for cumbre_dctry in cumbres_list:#este for recorre cada cumbre de la expedicion
        cumbre_mes=randint(1,12)
        if cumbre_mes in [1,3,5,7,8,10,12]:#esto es para que no existan incoherencias de mes con la cantidad de dias
            cumbre_dia=randint(1,31)
        elif cumbre_mes in [4,6,9,11]:
            cumbre_dia=randint(1,30)
        elif cumbre_mes==2:
            cumbre_dia=randint(1,28)
        cumbre_fecha=toFecha(cumbre_ano,cumbre_mes,cumbre_dia)
        cumbre_dctry['fecha']=cumbre_fecha#se agrega la fecha al diccionario

CSV_list=[['Expedicion','Andinista','Pais','Cumbre','Latitud','Longitud','Fecha']]#primera linea del csv, etiquetas

for expedicion_dctry in decode['expediciones']:#se recorre cada expedicion
    expedicion_numero= str(expedicion_dctry['numero'])
    andinistas_list= expedicion_dctry['andinistas']
    cumbres_list=expedicion_dctry['cumbres']
    for cumbre_dctry in cumbres_list:#se recorre cada cumbre
        cumbre_fecha=cumbre_dctry['fecha']
        cumbre_lat=str(cumbre_dctry['lat'])
        cumbre_lon=str(cumbre_dctry['lon'])
        cumbre_nombre=cumbre_dctry['nombre'].encode('utf-8')
        for andinista_dctry in andinistas_list:#se recorre cada andinista por cada cumbre
            andinista_numero=str(andinista_dctry['numero'])
            andinista_pais=andinista_dctry['pais'].encode('utf-8')
            subida_info_list=[expedicion_numero,andinista_numero, \
            andinista_pais,cumbre_nombre,cumbre_lat, \
            cumbre_lon,cumbre_fecha]#esta es la lista de informacion de ese andinista al subir dicha cumbre en cada expedicion
            CSV_list.append(subida_info_list)#se agrega la fila de dicho andinista

with open('traduccionjson.csv','w') as file:
  writer = csv.writer(file)
  for row in CSV_list:
    writer.writerow(row)

print('\nDone\n')#mensaje para ver que se completó el proceso
