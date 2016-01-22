package ch.icclab.cyclops.dashboard.applicationFactory;

import ch.icclab.cyclops.dashboard.application.AbstractApplication;
import ch.icclab.cyclops.dashboard.load.Loader;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.Context;

/**
 * @author Manu
 *         Created by root on 16.11.15.
 */
public abstract class AbstractApplicationFactory {
    final static Logger logger = LogManager.getLogger(AbstractApplicationFactory.class.getName());

    public static AbstractApplication getApplication(Context context) {
        try {
            // get environment settings
            Loader loader = Loader.createInstance(context);

            logger.debug("Attempting to get the Environment from the Configuration file.");
            String applicationClassName = Loader.getEnvironment();
            String packagePath = "ch.icclab.cyclops.dashboard.applicationFactory.";
            logger.debug("Attempting to create the application Class");
            AbstractApplicationFactory creator = (AbstractApplicationFactory) Class.forName(packagePath
                    .concat(applicationClassName).concat("DashboardApplicationFactory")).newInstance();
            return creator.loadApplication();
        } catch (Exception e) {
            logger.error("Error while getting the Application Class loaded: " + e.getMessage());
        }
        return null;
    }

    public abstract AbstractApplication loadApplication();
}
