# Trivia Titans Backend

This is the backend for the Trivia Titans app. It is a serverless application that uses the serverless framework to deploy to the cloud.

## Deployment

### Environment Variables

The following environment variables are required for deployment:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_REGION`
* `AWS_ACCOUNT_ID`

It is highly recommended to use something like `direnv` to manage these variables in your local environment by creating a `.envrc` file in the root of the project with the following contents:

```text
export AWS_ACCESS_KEY_ID=abc
export AWS_SECRET_ACCESS_KEY=abc
export AWS_SESSION_TOKEN=abc
export AWS_REGION=abc
export AWS_ACCOUNT_ID=abc
```

### Deploy

To deploy, run the following command:

```bash
serverless deploy
```

After deploying, you should see output similar to:

```bash
Deploying trivia-titans-backend to stage dev (us-east-1)

✔ Service deployed to stack trivia-titans-backend-dev (33s)

endpoint: GET - https://vru3427voi.execute-api.us-east-1.amazonaws.com/
functions:
  api: trivia-titans-backend-dev-api (320 B)

Improve API performance – monitor it with the Serverless Console: run "serverless --console"
```

### What's going on?

When you run `serverless deploy`, the framework will use the AWS provider to provision the defined resources in the `serverless.yml` file. In our case, it provisions an API Gateway endpoint and a Lambda function. The framework will also package up our application code, upload it to S3, and deploy it to Lambda. The packaging phase uses `esbuild` to bundle our code and its dependencies into a single file. This helps us in the following ways:

* Reduces the size of our deployment package. This is important because lambda functions have a maximum size of 50MB for the deployment package and a maximum uncompressed size of 250MB. Node modules can be quite large, so bundling allows us to reduce the size of our deployment package by packaging only the code we need.

* Reduces the cold start problem. When a lambda function is invoked for the first time, it needs to be initialized. This can take a few seconds. By bundling our code, we reduce the amount of code that needs to be initialized, which reduces the cold start time.

Alternatives for bundling include `webpack` and `rollup`. `esbuild` is a newer bundler that is written in Go and is much faster than the alternatives. It is also much easier to configure. We can also containerize our lambdas using `docker` but this will have a lot of overhead and will increase the cold start time. Besides, it also makes the builds slower.

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```json
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```

Alternatively, it is also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```bash
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).
