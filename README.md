# Just some simple APIs for Romania corona data

The APIs will be available on [valipank.ro](http://valipank.ro/corona) and also on [pank.go.ro](http://pank.go.ro/corona) 
(as a sort-of-a backup)

I. [http://valipank.ro/corona/api/v1/ro/ro_judete.json](http://valipank.ro/corona/api/v1/ro/ro_judete.json) - is a "static" JSON file containig all the counties in Romania (called județe; județ on singular) and the latest information. For every county there are:

- abreviation
- full name
- confirmed cases when generating the file
- incidence
- there is also a count (it"s always 42 🙂 )
- load_date is the date wen the file was generated

In a near future I'd like also to implement a swagger-like documentation for the exposed APIs.

Be patient - I'm learning also PHP (crash course mode) in order to expose dynamic content (from a MariaDB data base).
In the first version of the APIs (v1) I'll use direct call to php pages with GET parameters.
( _I'm learning how to do it the proper way_  - fine looking URIs)

In this repo I also have the source code for the websites mentiond above.

---

Please feel free to suggest anything that might be usefull.
