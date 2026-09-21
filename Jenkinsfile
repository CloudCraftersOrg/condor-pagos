@Library('condor-shared') _

pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
    }

    stages {
        stage('Test') {
            steps {
                // AL2's glibc (2.26) can't run Node >=24 natively (nodesource
                // requires glibc >=2.28) - run inside node:24-alpine instead.
                sh '''
                    docker run --rm -v "$WORKSPACE":/app -w /app node:24-alpine sh -c "npm install && npm test"
                '''
            }
        }
        stage('Build and push image') {
            steps {
                condorEcrBuildPush(repository: 'condor-pagos')
            }
        }
        stage('Resolve database connection') {
            steps {
                script {
                    def dbEndpoint = sh(
                        script: "aws rds describe-db-clusters --db-cluster-identifier condor-pagos-db --query 'DBClusters[0].Endpoint' --output text",
                        returnStdout: true
                    ).trim()
                    def secretArn = sh(
                        script: "aws rds describe-db-clusters --db-cluster-identifier condor-pagos-db --query 'DBClusters[0].MasterUserSecret.SecretArn' --output text",
                        returnStdout: true
                    ).trim()
                    def dbPassword = sh(
                        script: "aws secretsmanager get-secret-value --secret-id '${secretArn}' --query SecretString --output text | python3 -c 'import json,sys; print(json.load(sys.stdin)[\"password\"])'",
                        returnStdout: true
                    ).trim()
                    env.DATABASE_URL = "mysql://pagos:${dbPassword}@${dbEndpoint}/pagos"
                }
            }
        }
        stage('Deploy') {
            steps {
                condorHelmUpgrade(
                    clusterName: 'condor-pagos',
                    namespace: 'pagos',
                    releaseName: 'pagos',
                    chartPath: 'chart/',
                    extraSet: [
                        'image.repository=337058058699.dkr.ecr.us-east-1.amazonaws.com/condor-pagos',
                        "image.digest=${env.IMAGE_DIGEST}",
                        "env.DATABASE_URL=${env.DATABASE_URL}",
                    ],
                )
            }
        }
    }
}
