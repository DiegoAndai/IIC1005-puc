% Este archivo es una representación de la
% nomenclatura de parentesco español, en base
% solo a relaciones de progenitor. La fuente
% es https://es.wikipedia.org/wiki/Anexo:Nomenclatura_de_parentesco_en_espa%C3%B1ol
% El individuo central se denomina 'Yo'.
% Resulta útil ocupar las relaciones de las otras
% preguntas en base a este 'Yo' ya que los resultados
% serán fácilmente interpretables, por ejemplo
% al buscar primo_grado_k('Yo',Y,2), el programa
% responderá (o debiese responder) Y='Primos segundos'.

progenitor('Tatarabuelos','Bisabuelos').
progenitor('Tatarabuelos','Tíos bisabuelos').

progenitor('Tíos bisabuelos','Tíos abuelos segundos').

progenitor('Tíos abuelos segundos','Tíos terceros').

progenitor('Tíos terceros','Primos terceros').

progenitor('Bisabuelos','Abuelos').
progenitor('Bisabuelos','Tíos abuelos').

progenitor('Tíos abuelos','Tíos segundos').

progenitor('Tíos segundos','Primos segundos').

progenitor('Primos segundos','Sobrinos terceros').

progenitor('Abuelos','Padres').
progenitor('Abuelos','Tíos').

progenitor('Tíos','Primos').

progenitor('Primos','Sobrinos segundos').

progenitor('Sobrinos segundos','Sobrinos nietos segundos').

progenitor('Padres','Yo').
progenitor('Padres','Hermanos').

progenitor('Hermanos','Sobrinos').

progenitor('Sobrinos','Sobrinos nietos').

progenitor('Sobrinos nietos','Sobrinos bisnietos').

progenitor('Sobrinos bisnietos','Sobrinos tataranietos').

progenitor('Yo','Hijos').
progenitor('Cónyuge','Hijos').

progenitor('Hijos','Nietos').
progenitor('Yernos/Nueras','Nietos').

progenitor('Nietos','Bisnietos').

progenitor('Bisnietos','Tataranietos').

progenitor('Suegros','Cónyuge').
progenitor('Suegros','Cuñados').

progenitor('Abuelos políticos','Suegros').
progenitor('Abuelos políticos','Tíos políticos').

progenitor('Tíos políticos','Primos políticos').
