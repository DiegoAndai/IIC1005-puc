% Esta es la reimplementación de suma
% pedida, basándose en el código python
% correspondiente.

suma(0,N,N).
suma(s(X),Y,Z) :- suma(X,s(Y),Z).
