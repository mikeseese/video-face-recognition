FROM postgres:11

ENV POSTGRES_DB vfr

COPY psql_init.sql /docker-entrypoint-initdb.d/
