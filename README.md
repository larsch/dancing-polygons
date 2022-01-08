# dancing-polygons
Dancing Polygons

See https://larsch.github.io/dancing-polygons/

Inspired by Mathologer's [3-4-7 miracle video](https://youtu.be/oEN0o9ZGmOM).

## Description

The outer circle has *A* smaller circles rolling on the inside of it's
circumference. Each smaller circle contains a regular polygon with *B* sides
around its centre.

A star can be constructed with *A+B* points, jumping *B* points for each line
segment of the star. When *GCD(A, B)=1*, this will be a regular star polygon
with *p=A+B* and q=*B*. Otherwise, multiple polygons are needed to complete the
star (e.g. two triangles making a hexagram).

The size of the polygons inside the inner circles is chosen such that it exactly
touches the lines of the star (which are cords of the outer circle). This makes
the path the vertices move really close to linear (except near the points of the
star).

A second set of polygons can be constructed by connecting the first vertices of
each original polygon, all the second vertices, and so one. These will also be
regular polygons with *A* sides.
