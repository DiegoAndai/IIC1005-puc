--Diego Andai Castilla

--Consulta 1
SELECT  users.id AS 'User ID',
        occupations.name 'User Occupation'
  FROM users
  JOIN occupations
  ON users.occupation_id=occupations.id
  WHERE users.id IN ( SELECT user_id
                      FROM ratings
                      WHERE movie_id=(SELECT id
                                      FROM movies
                                      WHERE title LIKE 'Like Water For Chocolate%'));
--Otra forma de hacer la Consulta 1
SELECT users.id, occupations.name
FROM movies
  LEFT JOIN ratings
  ON movies.id=ratings.movie_id
  LEFT JOIN users
  ON ratings.user_id=users.id
  LEFT JOIN  occupations
  ON users.occupation_id=occupations.id
WHERE movies.title
LIKE 'Like Water For Chocolate%'
ORDER BY users.id;

--Consulta 2
SELECT  occupations.name AS 'Occupation',
        COUNT(*) AS 'Count'
FROM users
  JOIN occupations
  ON occupations.id=users.occupation_id
GROUP BY occupation_id;


--Consulta 3
SELECT  genres.name AS 'Genre',
        COUNT(DISTINCT genres_movies.movie_id) 'Movie Count',
        AVG(ratings.rating) 'Average Rating'
FROM genres_movies
  JOIN genres
  ON genres_movies.genre_id=genres.id
  JOIN ratings
  ON genres_movies.movie_id=ratings.movie_id
GROUP BY genres.name;
