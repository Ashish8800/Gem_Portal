pipeline{
    agent any
    stages{
        stage("Clone Code"){
            steps{
                checkout scm
            }
            
        }         
        stage("Deploy"){
            steps{
                echo "Deploying the Container"
                sh "docker-compose down --rmi all && docker system prune && docker-compose up -d"
            }
           
        }
      
    }
}
