# Simple job-server written in TypeScript

## Api usage

Create job

`curl -X POST http://localhost:8080/create/job1 --data-binary @test.txt`

Get job status

`curl -X GET http://localhost:8080/status/job1`

Get job result

`curl -X GET http://localhost:8080/get/job1 --output converted.txt`

Remove finished or failed job

`curl -X GET http://localhost:8080/remove/job1`
