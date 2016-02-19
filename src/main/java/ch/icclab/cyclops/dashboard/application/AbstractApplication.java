package ch.icclab.cyclops.dashboard.application;

import ch.icclab.cyclops.dashboard.database.DatabaseHelper;
import ch.icclab.cyclops.dashboard.database.DatabaseInteractionException;
import ch.icclab.cyclops.dashboard.errorreporting.ErrorReporter;
import ch.icclab.cyclops.dashboard.login.Login;
import ch.icclab.cyclops.dashboard.prediction.UsagePrediction;
import ch.icclab.cyclops.dashboard.registration.Registration;
import ch.icclab.cyclops.dashboard.token.TokenInfo;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.Application;
import org.restlet.Restlet;
import org.restlet.routing.Router;

/**
 * @author Manu
 * Created by root on 16.11.15.
 */
public abstract class AbstractApplication extends Application{
    final static Logger logger = LogManager.getLogger(DashboardApplication.class.getName());

    Router router = new Router(getContext());
    DatabaseHelper dbHelper = new DatabaseHelper();

    @Override
    public Restlet createInboundRoot(){
        createDatabases();
        registerAdminAccount();
        logger.debug("Attempting to create the common routes.");
        router.attach("/login", Login.class);
        router.attach("/tokeninfo", TokenInfo.class);
        router.attach("/registration", Registration.class);
        router.attach("/adminRegistration", Registration.class);
        router.attach("/prediction", UsagePrediction.class);
        logger.debug("Attempting to create the specific routes");
        createRoutes();
        return router;
    }

    private void registerAdminAccount(){
        logger.debug("Attempting to create the default admin account.");
        try {
            Registration registration = new Registration();
            registration.registerAdmin();
            logger.debug("Default admin account created");
        }catch (Exception e){
            logger.error("Couldn't create the default admin account.");
        }
    }

    private void createDatabases(){
        try {
            logger.trace("Attempting to Create the database.");
            dbHelper.createDatabaseIfNotExists();
            logger.trace("Database created.");
        } catch (DatabaseInteractionException e) {
            logger.error("Error while creating the Database: "+e.getMessage());
            ErrorReporter.reportException(e);
        }
    }

    public abstract void createRoutes();
}
