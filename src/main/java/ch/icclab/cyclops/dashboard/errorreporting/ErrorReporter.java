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
package ch.icclab.cyclops.dashboard.errorreporting;

import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import com.rabbitmq.client.*;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.concurrent.TimeoutException;

/**
 * This class is on charge to report all the errors to the On-line error reporter service
 *
 */
public class ErrorReporter {
    private static final String EXCHANGE_NAME = "cyclops";
    final static Logger logger = LogManager.getLogger(ErrorReporter.class.getName());

    public static void reportException(Exception ex) {
        if(isExceptionReportingEnabled()) {
            try {
                Connection conn = getConnection();
                Channel channel = conn.createChannel();
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ex.printStackTrace(new PrintStream(baos));
                channel.basicPublish(EXCHANGE_NAME, "dashboard-errors", null, baos.toByteArray());
                channel.close();

            } catch (IOException e) {
                logger.error("Failed to open connection for error reporting: " + e.getMessage());
            } catch (TimeoutException e) {
                logger.error("Failed to open connection for error reporting: " + e.getMessage());
            }
        }
    }

    public static boolean isExceptionReportingEnabled() {
        String enabled = LoadConfiguration.configuration.get("ERROR_REPORTER_ENABLED");
        return enabled.equals("true");
    }

    private static Connection getConnection() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(LoadConfiguration.configuration.get("ERROR_REPORTER_HOST"));
        factory.setPort(Integer.parseInt(LoadConfiguration.configuration.get("ERROR_REPORTER_PORT")));
        factory.setVirtualHost(LoadConfiguration.configuration.get("ERROR_REPORTER_VIRTUAL_HOST"));
        factory.setUsername(LoadConfiguration.configuration.get("ERROR_REPORTER_USERNAME"));
        factory.setPassword(LoadConfiguration.configuration.get("ERROR_REPORTER_PASSWORD"));
        return factory.newConnection();
    }
}
