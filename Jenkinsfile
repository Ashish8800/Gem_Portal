pipeline{
    agent any
    
    environment {
        GITHUB_TOKEN= credentials('token_ashish')
        PATH = "$PATH:/usr/bin" // Add the directory where docker-compose is installed
    }
    
    stages{
        stage("Clone Code"){
            steps{
                echo "Cloning the code"
                git branch: 'main', credentialsId: 'token_ashish', url: 'https://github.com/ashish8800/GeM_Backend.git'
            }
            
        }

        stage("building the code"){
            steps{
                echo "Building the Image"
                sh "cd ${WORKSPACE} && docker build -t ghcr.io/ashish8800/gem_backend:latest ."
            }
                       
        }    
            
        
        stage("Push to Docker Hub"){
            steps{
                echo "Pushing the Image"
                sh "export CR_PAT=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"
                sh "echo $GITHUB_TOKEN_PSW | docker login ghcr.io -u $GITHUB_TOKEN_USR --password-stdin"
                sh "docker push ghcr.io/ashish8800/gem_backend"
                
            }
            
        }
        stage("Remove Container"){
            steps{
                echo "Removeing the Container"
                sh "docker rm -f gem_backend gem_frontend"
                sh "docker rmi -f ghcr.io/ashish8800/gem_backend ghcr.io/ashish8800/gem_frontend "
               
        
            }
           
        }
        stage("Deploy"){
            steps{
                echo "Deploying the Container"
                sh "docker-compose up -d"
            }
           
        }
    }
}
