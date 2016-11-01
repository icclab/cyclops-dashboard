/*
 * Copyright (c) 2016. Zuercher Hochschule fuer Angewandte Wissenschaften
 *  All Rights Reserved.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at
 *
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *     WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *     License for the specific language governing permissions and limitations
 *     under the License.
 */

/*
 *     Author: Piyush Harsh,
 *     URL: piyush-harsh.info
 */
package ch.cyclops;

import ch.cyclops.load.Loader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Created by harh on 27/07/16.
 */


@SpringBootApplication
public class Application {

    private static final int OK_HELP = 1;
    private static final int ERR_PARAMS = 2;
    private static final int ERR_SETTINGS = 3;
    private static final int ERR_INFLUXDB = 4;
    private static final int ERR_RABBITMQ = 5;
    private static final int ERR_ROUTER = 6;
    private static final int ERR_START = 7;

    private static final Boolean EMPTY_LINE = true;
    private static final Boolean NO_EMPTY_LINE = false;

    private static final String helpMessage = String.join(System.getProperty("line.separator"),
            "RCB Cyclops: Dashboard micro service",
            "Author: Manu Perez, ICCLab ZHAW", "",
            "Required parameters: path to configuration file",
            "Optional parameters: HTTP port","",
            "Example: java -jar udr.jar config.txt 4567");


    public static void main (String[] args)
    {
        outputProgressBar("Loading RCB Cyclops Dashboard micro service ");

        // check params and potentially stop execution
        checkParameters(args);

        // check help parameter and potentially output it
        String param = args[0];
        checkHelp(param);

        checkConfigurationFile(param);

        SpringApplication.run(Application.class, args);
    }
    /**
     * Check number of parameters
     * @param args as string array
     */
    private static void checkParameters(String[] args) {
        if (args.length == 0) {
            String log = "A configuration file path has to be provided (as argument), otherwise UDR micro service cannot be properly loaded";
//            logger.error(log);
            System.err.println(log);
            System.exit(ERR_PARAMS);
        }

        outputProgressBar();
    }

    /**
     * Check whether parameter was help
     * @param param to be examined
     */
    private static void checkHelp(String param) {
        if (param.equals("-h") || param.equals("--help")) {
            System.out.println(helpMessage);
            System.exit(OK_HELP);
            System.exit(0);
        }

//        outputProgressBar();
    }

    /**
     * Make sure configuration file is valid
     * @param param path
     */
    private static void checkConfigurationFile(String param) {
        try {
            // create and parse configuration settings
            Loader.createInstance(param);
        } catch (Exception e) {
            String log = "The configuration file is corrupted, make sure it's according to documentation and all fields are specified";
//            logger.error(log);
            System.err.println(log);
            System.exit(ERR_SETTINGS);
        }

        outputProgressBar();
    }

    private static void outputProgressBar(String text, Boolean ... emptyLine) {
        if (emptyLine.length > 0 && emptyLine[0]) {
            System.out.println();
        }

        System.out.print(text);

        if (emptyLine.length > 1 && emptyLine[1]) {
            System.out.println();
        }
    }

    private static void outputProgressBar() {
        outputProgressBar("...");
    }

}
