echo "---------------------------------------------------------------------------"
echo "| Installing the Java openjdk-7-jre"
echo "| Java 7 is the baseline Java version"
echo "---------------------------------------------------------------------------"
sudo -k
sudo apt-get update
sudo apt-get install -y openjdk-7-jre
sudo apt-get install -y openjdk-7-jdk
echo "---------------------------------------------------------------------------"
echo "| Installing Maven and Git"
echo "---------------------------------------------------------------------------"
sudo apt-get install -y maven2
sudo apt-get install -y git
echo "---------------------------------------------------------------------------"
echo "| Installing tomcat7 and tomcat7-admin"
echo "---------------------------------------------------------------------------"
#apt-get install -y tomcat7
#apt-get install -y tomcat7-admin
echo "---------------------------------------------------------------------------"
echo "| Installing Sqlite "
echo "---------------------------------------------------------------------------"
sudo apt-get install -y sqlite
sudo -k
echo "---------------------------------------------------------------------------"
echo "| Installation Complete "
echo "---------------------------------------------------------------------------"
echo "---------------------------------------------------------------------------"
echo "| Creating Necessary Directories"
echo "---------------------------------------------------------------------------"
cd $HOME
mkdir $HOME/bills/
chmod 777 $HOME/bills/
mkdir $HOME/sqlite/
chmod 777 $HOME/sqlite/
sudo mkdir /var/log/dashboard/
sudo chmod 777 /var/log/dashboard/
sudo -k
echo "---------------------------------------------------------------------------"
echo "| Getting the Dashboard package"
echo "---------------------------------------------------------------------------"
#git clone git@srv-lab-t-401.zhaw.ch:cyclops/cyclops-support.git
echo "---------------------------------------------------------------------------"
echo "| Triggering the build for Dashboard and creation of WAR file "
echo "---------------------------------------------------------------------------"
cd cyclops-support
#git checkout gate_keeper_integration
cd dashboard
mvn clean install
echo "---------------------------------------------------------------------------"
echo "| Deploying the WAR file to the Tomcat "
echo "---------------------------------------------------------------------------"
cd target
sudo cp *.war /var/lib/tomcat7/webapps/dashboard.war
echo "---------------------------------------------------------------------------"
echo "| Restarting Tomcat "
echo "---------------------------------------------------------------------------"
sudo service tomcat7 restart
sudo -k
echo "---------------------------------------------------------------------------"
echo "| Setting up the database "
echo "---------------------------------------------------------------------------"
sqlite3 $HOME/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS meter_source (ID INTEGER PRIMARY KEY, source        TEXT    NOT NULL);";
sqlite3 $HOME/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS bills (ID INTEGER PRIMARY KEY, userId        TEXT    NOT NULL, billPDF       TEXT    NOT NULL, fromDate      TEXT    NOT NULL, toDate        TEXT    NOT NULL, approved      BOOLEAN NOT NULL DEFAULT 0, paid          BOOLEAN NOT NULL DEFAULT 0, dueDate       TEXT    NOT NULL, paymentDate   TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
sqlite3 $HOME/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS external_id (ID INTEGER PRIMARY KEY, userId        TEXT    NOT NULL, meterSourceId INTEGER NOT NULL, meterUserId   TEXT    NOT NULL);";
sqlite3 $HOME/sqlite/dashboard.db "CREATE TABLE IF NOT EXISTS gatekeeper_users (username      TEXT        PRIMARY KEY, password      TEXT        NOT NULL, userId        TEXT        NOT NULL);";
sqlite3 $HOME/sqlite/dashboard.db "CREATE TABLE  IF NOT EXISTS dashboard_users (username          TEXT        PRIMARY KEY, password           TEXT        NOT NULL, name               TEXT        NOT NULL, surname            TEXT        NOT NULL, email              TEXT        NOT NULL, isAdmin            BOOLEAN     NOT NULL, keystoneId         TEXT);";
chmod 777 $HOME/sqlite/dashboard.db
echo
"---------------------------------------------------------------------------"
echo
"---------------------------------------------------------------------------"
echo "|"
echo "| Installation Complete "
echo "|"
echo "| Ready to Rock and Roll"
echo "|"
echo "---------------------------------------------------------------------------"
echo
"---------------------------------------------------------------------------"
