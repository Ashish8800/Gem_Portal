pipeline{
    agent any
    
    environment {
        GITHUB_TOKEN= credentials('tokenashish')
        PATH = "$PATH:/usr/bin" // Add the directory where docker-compose is installed
    }
    
    stages{
        stage("Clone Code"){
            steps{
                echo "Cloning the code"
                git branch: 'main', credentialsId: 'tokenashish', url: 'https://github.com/Ashish8800/Gem_Portal.git'
            }
            
        }
         stage("building the frontend code"){
            steps{
                echo "Building the Image"
                sh "cd ${WORKSPACE}/frontend && docker build -t ghcr.io/ashish8800/gem_frontend:latest ."
            }
                       
        } 
        
        stage("building the backend code"){
            steps{
                echo "Building the Image"
                sh "cd ${WORKSPACE}/backend && docker build -t ghcr.io/ashish8800/gem_backend:latest ."
            }
                       
        }    
            
        
        stage("Push to Docker Hub"){
            steps{
                echo "Pushing the Image"
                sh "export CR_PAT=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"
                sh "echo $GITHUB_TOKEN_PSW | docker login ghcr.io -u $GITHUB_TOKEN_USR --password-stdin"
                sh "docker push ghcr.io/ashish8800/gem_backend"
                sh "docker push ghcr.io/ashish8800/gem_frontend"
                
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
