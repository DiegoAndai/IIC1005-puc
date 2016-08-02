$( document ).ready(function() {

/*DEFINIR FUNCIONES: (hay cuatro funciones que defino dento del proceso de datos de d3, para no tener
                      problemas con el scope)*/

  function inArray(x,array){ //comprueba que algo esta en una lista
    var bool=false
    for (index in array){
      if (x==array[index]){
        bool=true
      }
    }
    return bool;
  }

  function parseCsv(csv){ //crea diccionario para ingresar a crossfilter, de la forma [{expedicion:1,andinista:1,pais:alemania...},{...},....]
    var cant_expediciones=csv.length-1
    var keys=csv[0]
    var cant_keys=keys.length
    var data=[]
    var values=csv.slice(1)
    var j=0;
    while(j<cant_expediciones){
      var dctry_data={}
      for (i=0;i<cant_keys;i++){
        var dato=values[j][i];
        dctry_data[keys[i]]=dato;
      }
      data.push(dctry_data);
      j++;
    }
    return data;
  };

/*cambiar modo de los marcadores, ademas cambia los mensajes que estan en el modulo del mapa*/
  function changeMarkers(){
    switch (modoMapa) {
      case 'marker':
        modoMapa='circle'
        document.getElementById("cambiarMarcadores").innerHTML="Mostrar marcadores de posición"
        document.getElementById("mapaLabel").innerHTML="Área de los circulos proporcional a la cantidad de visitas"
        break;
      case 'circle':
        modoMapa='marker';
        document.getElementById("cambiarMarcadores").innerHTML="Mostrar circulos relativos a la cantidad de visitas";
        document.getElementById("mapaLabel").innerHTML="Haga click en los marcadores para mostrar nombre"
        break;
    }
    dc.disableTransitions=true;
    dc.redrawAll();
    dc.disableTransitions=false;
  }

/*esta funcion (remove_bins) la saque de los archivos de dc.js: https://github.com/dc-js/dc.js/wiki/FAQ#remove-particular-bins.
  Originalmente hacia invisibles las categorias que eran 0, la modifique para eliminar valores
  determinados, especificamente los que no estan en listaElementos*/
  function remove_bins(source_group,listaElementos) {
      function eliminarValores(d) {
        if (inArray(d.key,listaElementos)){
          return d.value;}
      }
      return {
          all: function () {
              return source_group.all().filter(eliminarValores);
          },
          top: function(n) {
              return source_group.top(Infinity)
                  .filter(eliminarValores)
                  .slice(0, n);
          }
      };
  }

/*la siguiente funcion asume que los elementos estan en orden, por lo tanto retorna el indice del
  primer cero que encuentra, o en su defecto la cantidad de elementos de la lista, si es que esta
  no contiene ningún cero*/
  function calcularCantidadElementosDistintosCero(array){
    for (i in array){
      if (array[i].value==0){
        return i
      }
    }
    return array.length
  }


//INICIALIZAR EL MAPA:
    L.mapbox.accessToken = 'pk.eyJ1IjoiZGllZ29hbmRhaSIsImEiOiJjaWxzcWlwanQwMDJmdHlrcjd5OGxpeXU0In0.wfs1_4JCdP8T0Mz7yjMK-A';
    var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/diegoandai.pikk5kgd/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var map = L.map('map', {maxZoom:10,minZoom:1})
        .addLayer(mapboxTiles)
        ;

    function centrarMapa(){
      map.fitBounds(markers.getBounds(), {padding:[40,40]});
    }

    var markers = new L.featureGroup();//acá se guardan los marcadores para agregarlos juntos al mapa

    var modoMapa='circle'//esta variable representa si se muestran marcadores de circulo o normales

//CREAR VARIABLES DE GRAFICOS:
      var repCumbres = dc.rowChart("#representatividadCumbres");
      var repPaises = dc.pieChart("#representatividadPaises");
      var statAno = dc.pieChart("#estadisticasAno");
      var statMes = dc.pieChart("#estadisticasMes");
      var statDia = dc.pieChart("#estadisticasDia");

//PROCESAMIENTO DE DATOS CON D3, CROSSFILTER Y DC:
      d3.text('traduccionjson.csv', function(error, _data){
//INICIALIZAR DATA, DIMENSIONES, GRUPOS, FORMATEAR FECHAS (CROSSFILTER Y D3)
            var table = d3.csv.parseRows(_data);
            var data=parseCsv(table);//parseCsv es una funcion propia, ver FUNCIONES mas arriba
            var ndx=crossfilter(data);
//formatear fechas:
            var formatoFecha = d3.time.format('%d/%m/%Y');
            var formatoAno = d3.time.format('%Y');
            var formatoMes = d3.time.format('%B');
            var formatoDia = d3.time.format('%A');
             data.forEach(function(d) {
              d.fechaData = formatoFecha.parse(d.Fecha);
              d.anoData = formatoAno(d.fechaData);
              d.mesData = formatoMes(d.fechaData);
              d.diaData = formatoDia(d.fechaData)
            });
//crear dimensiones:
            var pais = ndx.dimension(function(d){ return d.Pais;});
            var expedicion = ndx.dimension(function(d){return d.Expedicion})
            var cumbre = ndx.dimension(function(d){ return d.Cumbre});
            var cumbre_canpos = ndx.dimension(function(d){ return [d.Cumbre,d.Latitud,d.Longitud]})
            var statAnoDimension = ndx.dimension(function(d){ return d.anoData;});
            var statMesDimension = ndx.dimension(function(d){ return d.mesData;});
            var statDiaDimension = ndx.dimension(function(d){ return d.diaData;});
//crear grupos:
            var pais_cant = pais.group().reduceCount();
            var exp_cant = expedicion.group().reduceCount();
            var cumbre_cant = cumbre.group().reduceCount();
            var cumbre_canposgroup=cumbre_canpos.group().reduceCount();
            var statAnoGroup = statAnoDimension.group().reduceCount();
            var statMesGroup = statMesDimension.group().reduceCount();
            var statDiaGroup = statDiaDimension.group().reduceCount();

/*FUNCIONES 2:  estas las dejé acá para no tener problema con la existencia de dimensiones como
                cumbre_cant o la definicion de cumbresGroup, si bien se puede llevar para afuera
                preferí evitar problemas con el scope, además eran muchos los parametros que se
                necesitaban para moverlas afuera, por simpleza las dejé aquí*/

                /*retorna una lista con los nombres de los elementos que deben incluirse en la pagina actual,
                  se ocupa para la implementación del gráfico por paginas de las cumbres, su source es una
                  lista que contiene todas las cumbres, busca en esta las cumbres de la pagina y las añade a la lista
                  que retorna*/
                function definirElementosDePagina(numeroDePagina){
                  listaCumbresPagina=[]
                  switch (numeroDePagina){
                    case paginasTotales:
                      var cantidadCumbresUltimaPagina=cumbresTotales%cumbresPorPagina
                      for (i=0;i<cantidadCumbresUltimaPagina;i++){
                        listaCumbresPagina.push(cumbre_cant.top(Infinity)[i+cumbresPorPagina*(paginaActual-1)].key)}
                      break;
                    default:
                    for (i=0;i<cumbresPorPagina;i++){
                      listaCumbresPagina.push(cumbre_cant.top(Infinity)[i+cumbresPorPagina*(paginaActual-1)].key)
                      /*con esto se considera el corrimiento, si estoy en la pagina 2 y hay 9 elementos por pagina,
                        el primer elemento de esta es 0+9*1=9, que es el indice del décimo elemento de la fuente (source)*/
                    }
                    }
                    return listaCumbresPagina
                }

            function paginaSiguiente(){
              if (!(ultimaPagina || paginaActual==paginasTotales)){
                paginaActual+=1;
                document.getElementById("controlPaginaAtras").style.color="#187CBA";
              } else {
                return false//si estoy en la ultima pagina, se retorna falso y no se realiza nada
              }
              listaCumbresPagina=definirElementosDePagina(paginaActual)
              cumbresGroup=remove_bins(cumbre_cant,listaCumbresPagina)
              if (cumbresGroup.top(Infinity).length<paginasTotales || paginaActual==paginasTotales){
                ultimaPagina=true;
                document.getElementById("controlPaginaAdelante").style.color="#001C2B";//se inhabilita el boton
              }
              paginaLabel="Página "+paginaActual.toString()+" de "+paginasTotales.toString()+"</br>(Ordenadas decrecientemente)"
              document.getElementById("paginaLabel").innerHTML=paginaLabel
              return true
            }

            function paginaAnterior(){
              if (!(paginaActual==1)){
                document.getElementById("controlPaginaAdelante").style.color="#187CBA";
                paginaActual-=1;
                if (ultimaPagina){
                  ultimaPagina=false;//si estoy en la pagina 1, se retorna falso y no se realiza nada
                }
              } else {
                return false
              }
              listaCumbresPagina=definirElementosDePagina(paginaActual)
              cumbresGroup=remove_bins(cumbre_cant,listaCumbresPagina)
              if (paginaActual==1){
                document.getElementById("controlPaginaAtras").style.color="#001C2B";//se inhabilita el boton
              }
              paginaLabel="Página "+paginaActual.toString()+" de "+paginasTotales.toString()+"</br>(Ordenadas decrecientemente)"
              document.getElementById("paginaLabel").innerHTML=paginaLabel
              return true
            }


/*actualizarCumbresPorFiltro resetea el gráfico de cumbres, lo inicializa con las cumbres que cumplen
  los filtros cada vez que estos se realizan*/
            function actualizarCumbresPorFiltro(){
              paginaActual=1
              ultimaPagina=false;
              cumbresTotales=calcularCantidadElementosDistintosCero(cumbre_cant.top(Infinity));
              paginasTotales=Math.floor(cumbresTotales/cumbresPorPagina)+1;
              paginaLabel="Página "+paginaActual.toString()+" de "+paginasTotales.toString()+"</br>(Ordenadas decrecientemente)"
              document.getElementById("paginaLabel").innerHTML=paginaLabel
              document.getElementById("controlPaginaAtras").style.color="#001C2B"
              document.getElementById("controlPaginaAdelante").style.color="#187CBA"
              listaCumbresPagina=definirElementosDePagina(paginaActual)
              cumbresGroup=remove_bins(cumbre_cant,listaCumbresPagina)
              //cada vez se debe reasignar el grupo al grafico
              repCumbres.group(cumbresGroup)
            }
//VARIABLES PARA INICIALIZAR GRAFICO DE CUMBRES EN LA PAGINA 1:
            var listaCumbresPagina=[]
            var cumbresPorPagina=14;
            var cumbresTotales=calcularCantidadElementosDistintosCero(cumbre_cant.top(Infinity));
            var paginasTotales=Math.floor(cumbresTotales/cumbresPorPagina)+1
            var paginaActual=1;
            var ultimaPagina=false;
            /*listaCumbresPagina es la lista de cumbres que se deben mostrar, revisar (definirElementosDePagina) en FUNCIONES más arriba*/
            var listaCumbresPagina=definirElementosDePagina(paginaActual,paginasTotales,cumbresTotales,cumbresPorPagina,cumbre_cant.top(Infinity))
            /*cumbresGroup es un grupo que solo contiene cumbres que estan en listaCumbresPagina,
            revisar (remove_bins)  en FUNCIONES más arriba, este grupo se reasigna al grafico cada vez que sea necesario
            que muestre nuevos filtros, lo que se puede ver en las tres funciones que aparecen en
            FUNCIONES 2 más arriba*/
            var cumbresGroup=remove_bins(cumbre_cant,listaCumbresPagina)

//INICIALIZAR TEXTOS DINÁMICOS DEL GRÁFICO DE CUMBRES Y EL FOOTER DE LA PÁGINA:
            var subBannerText="Se analizaron "+exp_cant.size()+" expediciones, haga click en las distintas categorías para filtrar los datos. <h5 id='resetAll' class='resetAll'>Haga click aquí para quitar todos los filtros</h5>";
            document.getElementById("subBanner").innerHTML=subBannerText;
            var paginaLabel="Página "+paginaActual.toString()+" de "+paginasTotales.toString()+"</br>(Ordenadas decrecientemente)"
            document.getElementById("paginaLabel").innerHTML=paginaLabel;


//SETEAR GRÁFICOS:
      repPaises
          .width(321)
          .height(321)
          .slicesCap(10)
          .innerRadius(30)
          .minAngleForLabel(0.3)
          .renderTitle(true)
          .dimension(pais)
          .group(pais_cant)
          .on('filtered',function(d){
            actualizarCumbresPorFiltro();
          })
          .ordering(d3.ascending);

      repCumbres
          .width(400)
          .height(480)
          .dimension(cumbre)
          .group(cumbresGroup)
          .data(function (group) {
            return group.top(14) ;
          })
          .elasticX(true)
          .fixedBarHeight(26)
          .on('renderlet', function(d){ //setear marcadores, 2 modos: circulos o markers
            markers.clearLayers();//cada vez borra todos los marcadores y los redibuja
            if (modoMapa=='circle'){
//canposgroup es de la forma {[nombre cumbre,latitud,posición]:cantidad de veces que aparece la cumbre}
              cumbre_canposgroup.top(Infinity).forEach(function(d){
                if (d.value>0){//para no mostrar cumbres que según el filtro actual no tienen visitas
                  var posicion=[d.key[1],d.key[2]];
                  /*el radio es calculado asi para que el área represente la cantidad,
                    además lo multiplique por tres  spara que no fueran tan pequeños*/
                  var radio=3*Math.sqrt(d.value/Math.PI);
                  var marker = L.circleMarker(posicion,{color:"#1859BA",fillColor:"#187CBA",opacity:0.8,fillOpacity:0.4});
                  marker.setRadius(radio);
                  markers.addLayer(marker);
                }
              });
            } else if (modoMapa=='marker'){
                cumbre_canposgroup.top(Infinity).forEach(function(d){
                  if (d.value>0){
                    var posicion=[d.key[1],d.key[2]];
                    var marker=L.marker(posicion,{icon:L.mapbox.marker.icon({//propiedades gráficas
                                                            'marker-size': 'medium',
                                                            'marker-symbol': 'triangle',
                                                            'marker-color': '#187CBA'
                                                        })
                    });
                    marker.bindPopup(d.key[0]); //agrega un popup del nombre de la cumbre, para que se vea al hacer click
                    markers.addLayer(marker);
                  }
                });
              }
            map.addLayer(markers);
            map.fitBounds(markers.getBounds(), {padding:[40,40]});//ajustar mapa a los marcadores visibles
          });

      statAno
          .width(233)
          .height(233)
          .slicesCap(12)
          .innerRadius(20)
          .minAngleForLabel(0.3)
          .renderTitle(true)
          .dimension(statAnoDimension)
          .group(statAnoGroup)
          .on('filtered',function(d){
            actualizarCumbresPorFiltro();//es manual por la implementacion del grafico cumbres
          });

      statMes
          .width(321)
          .height(321)
          .slicesCap(12)
          .innerRadius(20)
          .minAngleForLabel(0.3)
          .renderTitle(true)
          .dimension(statMesDimension)
          .group(statMesGroup)
          .on('filtered',function(d){
            actualizarCumbresPorFiltro();
          })
          /*lo siguiente lo saque del ejemplo "http://austinlyons.github.io/dcjs-leaflet-untappd/",
          es para dar orden a cada pedazo del gráfico circular.
          Lo puse en ese orden extraño para que no se juntaran los nombres largos arriba o abajo,
          pues así se veía mal (se sobreponian)*/
          .ordering(function(d){
            var orden={
              'January': 6, 'February': 7, 'March': 8, 'April': 9,
              'May': 10, 'June': 11, 'July': 12, 'August':1,
              'September': 2, 'October': 3, 'November': 4, 'December': 5
              }
              return orden[d.key]
          })
          /*asigna el nombre en español*/
          .label(function(d){
            var espanol={
              'January': "Enero", 'February': "Febrero", 'March': "Marzo", 'April': "Abril",
              'May': "Mayo", 'June': "Junio", 'July': "Julio", 'August':"Agosto",
              'September': "Septiembre", 'October': "Octubre", 'November': "Noviembre",
              'December': "Diciembre"
              }
              return espanol[d.key]
          });

      statDia
          .width(233)
          .height(233)
          .slicesCap(12)
          .innerRadius(20)
          .minAngleForLabel(0.3)
          .renderTitle(true)
          .dimension(statDiaDimension)
          .group(statDiaGroup)
          .on('filtered',function(d){
            actualizarCumbresPorFiltro();
          })
          /*tal como el de los meses, lo saque de "http://austinlyons.github.io/dcjs-leaflet-untappd/"*/
          .ordering(function (d) {
              var orden = {
                'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
                'Friday': 4, 'Saturday': 5, 'Sunday': 6
              }
              return orden[d.key];
            })
            /*asigna el nombre en español*/
            .label(function (d) {
                var espanol= {
                  'Monday': "Lunes", 'Tuesday': "Martes", 'Wednesday': "Miércoles", 'Thursday': "Jueves",
                  'Friday': "Viernes", 'Saturday': "Sábado", 'Sunday': "Domingo"
                }
                return espanol[d.key];
              });

//DEFINIR FUNCIONES DE LOS BOTONES O CLICKS DE LA PÁGINA:
          d3.select('#resetpaises').on('click', function(d){
            repPaises.filterAll();
            dc.renderAll();
          })

          d3.select('#resetcumbres').on('click', function(d){
            repCumbres.filterAll();
            dc.renderAll();
          })

          d3.select('#resetdias').on('click', function(d){
            statDia.filterAll();
            dc.renderAll();
          })

          d3.select('#resetmes').on('click', function(d){
            statMes.filterAll();
            dc.renderAll();
          })

          d3.select('#resetano').on('click', function(d){
            statAno.filterAll();
            dc.renderAll();
          })

          d3.select('#resetAll').on('click', function(d){
            dc.filterAll();
            dc.renderAll();
          })

          d3.select('#controlPaginaAdelante').on('click',function(d){
            if(paginaSiguiente()){
            //cada vez se debe reasignar el grupo al grafico
            repCumbres.group(cumbresGroup);
            repCumbres.render()}
          })

          d3.select('#controlPaginaAtras').on('click',function(d){
            if(paginaAnterior()){
            //cada vez se debe reasignar el grupo al grafico
            repCumbres.group(cumbresGroup);
            repCumbres.render()}
          })

          d3.select('#centrarMapa').on('click',function(d){
            centrarMapa();
          })

          d3.select('#cambiarMarcadores').on('click',function(d){
            changeMarkers();
          })

//PROCESAR, INICIALIZAR Y MOSTRAR GRÁFICOS:
        dc.renderAll();

      });
});
