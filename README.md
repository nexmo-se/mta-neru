# Vonage Video API Medical Transcryption Analysis

This application shows how to integrate the Vonage Video API with AWS Medical transcription and Medical comprehend APIs to build a video conferencing application that performs a medical analysis on every user's speech with a focus on medical terms.

## Prerequisites

- You need to have the [neru CLI](https://vonage-neru.herokuapp.com/neru/guides/cli) installed and configured and be a bit familiar with the neru terminology.
- You need to have `AccessKeyId` and `SecretAccessKey` from AWS configured with the following policy

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "comprehendmedical:DescribeEntitiesDetectionV2Job",
                "comprehendmedical:DetectEntitiesV2",
                "comprehendmedical:InferRxNorm",
                "transcribe:StartStreamTranscription",
                "transcribe:StartMedicalStreamTranscriptionWebSocket",
                "transcribe:StartMedicalStreamTranscription",
                "transcribe:ListMedicalTranscriptionJobs",
                "transcribe:StartStreamTranscriptionWebSocket",
                "transcribe:ListMedicalVocabularies",
                "comprehendmedical:InferICD10CM"
            ],
            "Resource": "*"
        }
    ]
}
```

## How to deploy the app

This repository is intended to be used with the Neru (Vonage Serverless Cloud Platform). To run the project:

- Create a Vonage application via the CLI to host your app (`neru app create --name "Test app"`)
- Initialise the app (`neru init`)
- Install dependencies (`npm init`)
- Configure your project yml file correctly
- [Configure the secrets](https://vonage-neru.herokuapp.com/neru/guides/secrets) in your application
- Run `npm run front-build`
- Run `neru deploy`
