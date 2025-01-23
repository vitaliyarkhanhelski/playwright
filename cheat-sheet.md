```sh
# install playwright
npm init playwright@latest
```

```sh
# run all tests
npx playwright test
```

```sh
# run tests with video recording enabled
npx playwright test --headed --project=chromium
```


```sh
# show report after running tests:
npx playwright show-report
```



```sh
# to run a specific test with video:
npx playwright test tests/create-new-account.spec.ts
npx playwright test tests/zilStage.spec.ts
npx playwright test tests/experience_jwt.spec.ts
```


```sh
# makes the shell script executable
chmod +x run-local-tests-with-video-and-reports.sh
```

```sh
# run shell script in terminal
./run-local-tests-with-video-and-reports.sh
```

```sh
# SFDX Auth URL
force://<consumer-key>:<refresh-token>@<instance-url>

```

```sh
# Org description with Sfdx Auth Url
sf org display --verbose -o <YourAlias>

```