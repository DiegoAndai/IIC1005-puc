% El archivo family_tree está en el repositorio
% y es útil para probar las relaciones. Las demostraciones
% se basan en reglas de progenitor.
%
% Hay dos respuestas, que son básicamente lo mismo solo que
% una funciona con números y la otra con representación de
% sucesores: 0,s(0),s(s(0)),s(s(s(0))),etc. Comenté esta
% última pues me parece que es más natural trabajar con
% números, sin embargo, ambas debiesen funcionar igual y
% son el mismo algoritmo.
%
% Se considera 'Primo' al grado k=1, que corresponde a la
% descendencia del hermano de mi progenitor, así, un hipotético
% grado k=0 es un 'Hermano'. este algoritmo se basa en la
% idea que los progenitores de dos primos grado k son primos
% de grado k-1.

:- [family_tree].

primo_grado_k(X,Y,0) :- progenitor(Z,X),
                        progenitor(Z,Y),
                        X\=Y.

%primo_grado_k(X,Y,s(K)) :-  progenitor(Z,X),
%                            progenitor(W,Y),
%                            primo_grado_k(Z,W,K).

primo_grado_k(X,Y,K) :- progenitor(Z,X),
                        progenitor(W,Y),
                        V is (K-1),
                        primo_grado_k(Z,W,V).
