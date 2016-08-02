% La implementación de hermano y primo se basa
% en la existencia de una relación 'progenitor'
% que se encuentra en el principio del archivo
% con la forma:
%
%       progenitor(a,b)
%
% entendiendo que a es el progenitor de b.
%
% Para probar las relaciones, se puede descomentar
% el comando de la linea 15, importando un archivo
% que se encuentra en el mismo repositorio que este.
% (family_tree).

%:- [family_tree].

hermano(X,Y) :- progenitor(Z,X),
                progenitor(Z,Y),
                X \= Y.

primo(X,Y) :- hermano(W,Z),
              progenitor(W,X),
              progenitor(Z,Y).
