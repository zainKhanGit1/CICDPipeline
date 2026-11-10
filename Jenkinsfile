node{
    def app = "/var/www/SubnetCalculator"
    stage("Clean"){
        echo "Cleaning Repo"
        deleteDir();
    }
     stage("Clone"){
        echo "Cloning Project"
        git(
            branch: 'main',
            url: 'https://github.com/zainKhanGit1/CICDPipeline'
        )
    }
    // -p flag avoids error if already exiists
     stage("Deploy"){
        echo "Deploying the project"
        sh """
           sudo mkdir -p ${app}
           sudo rm -rf ${app}/*
           sudo cp -r * ${app}/  
           

           cd ${app}
           npm install
           npm run build



        """
        //cp -r * ${app}/  means copy all files recursively from source which is * (working diiirectory) to the app path   
    }
}