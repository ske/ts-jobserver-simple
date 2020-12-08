# Simple job-server written in TypeScript

## Api usage

Create job

`curl -X POST http://localhost:8080/create/job1 --data-binary @test.txt`

Returns http status code 201 on success.

Get job status

`curl -X GET http://localhost:8080/status/job1`

Returns http status code 200 on success.

Get job result

`curl -X GET http://localhost:8080/get/job1 --output converted.txt`

Returns http status code 200 on success.

Remove finished or failed job

`curl -X GET http://localhost:8080/remove/job1`

Returns http status code 204 on success.
