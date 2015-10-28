/*
 * Copyright (c) 2015. Zuercher Hochschule fuer Angewandte Wissenschaften
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

package ch.icclab.cyclops.dashboard.util;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.restlet.Context;
import org.restlet.data.MediaType;
import org.restlet.representation.FileRepresentation;
import org.restlet.resource.ClientResource;

import javax.servlet.ServletContext;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

public class LoadConfiguration extends ClientResource {
    final static Logger logger = LogManager.getLogger(LoadConfiguration.class.getName());

    //Instantiating the Instance variable for saving the config details
    public static HashMap<String, String> configuration;

    /**
     * Loads the configuration file
     * <p/>
     * Pseudo Code
     * 1. Create an instance of the ServletContext
     * 2. Get the relative path of the configuration.txt file
     * 3. Load the file and save the values into a static HashMap
     *
     * @param context
     * @throws IOException
     */
    public void run(Context context) throws IOException {
        logger.debug("Loading configuration...");
        configuration = new HashMap<String, String>();
        String nextLine;

        // Extract the ServletContext from the attributes of RestletContext
        ServletContext servlet = (ServletContext) context.getAttributes().get("org.restlet.ext.servlet.ServletContext");
        System.out.println("Reading the config file from " + servlet.getRealPath("/WEB-INF/configuration.txt"));
        // Get the path of the config file relative to the WAR
        String rootPath = servlet.getRealPath("/WEB-INF/configuration.txt");

        //Add WEB-INF path to access local images etc.
        String webInfPath = servlet.getRealPath("/WEB-INF");
        configuration.put("WEB-INF", webInfPath);

        Path path = Paths.get(rootPath);
        File configFile = new File(path.toString());
        FileRepresentation file = new FileRepresentation(configFile, MediaType.TEXT_PLAIN);

        // Read the values from the config file
        try {
            BufferedReader reader = new BufferedReader(file.getReader());
            while ((nextLine = reader.readLine()) != null) {
                String[] str = nextLine.split("==");
                configuration.put(str[0], str[1]);
            }
        } catch (IOException e) {
            logger.error("Error while Running the configuration: "+e.getMessage());
            logger.error("Failed to load the Config file");
            e.printStackTrace();
        }
        logger.debug("Configuration loaded.");
    }
}