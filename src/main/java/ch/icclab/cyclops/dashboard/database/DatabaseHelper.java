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
package ch.icclab.cyclops.dashboard.database;

import ch.icclab.cyclops.dashboard.bills.Bill;
import ch.icclab.cyclops.dashboard.externalMeters.ExternalUserId;
import ch.icclab.cyclops.dashboard.util.LoadConfiguration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;


import java.sql.*;
import java.sql.Statement;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

public class DatabaseHelper {
    final static Logger logger = LogManager.getLogger(DatabaseHelper.class.getName());

    private final static String CREATE_TABLE_BILLS = "CREATE TABLE IF NOT EXISTS bills" +
            "(ID INTEGER PRIMARY KEY," +
            " userId        TEXT    NOT NULL, " +
            " billPDF       TEXT    NOT NULL, " +
            " fromDate      TEXT    NOT NULL, " +
            " toDate        TEXT    NOT NULL, " +
            " approved      BOOLEAN NOT NULL DEFAULT 0, " +
            " paid          BOOLEAN NOT NULL DEFAULT 0, " +
            " dueDate       TEXT    NOT NULL, " +
            " paymentDate   TEXT, " +
            " created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";

    private final static String CREATE_TABLE_METER_SOURCE = "CREATE TABLE IF NOT EXISTS meter_source" +
            "(ID INTEGER PRIMARY KEY," +
            " source        TEXT    NOT NULL)";

    private final static String CREATE_TABLE_EXTERNAL_ID = "CREATE TABLE IF NOT EXISTS external_id" +
            "(ID INTEGER PRIMARY KEY," +
            " userId        TEXT    NOT NULL, " +
            " meterSourceId INTEGER NOT NULL, " +
            " meterUserId   TEXT    NOT NULL)";

    private final static String CREATE_TABLE_GATEKEEPER_USERS = "CREATE TABLE IF NOT EXISTS gatekeeper_users" +
            "(username      TEXT        PRIMARY KEY," +
            " password      TEXT        NOT NULL," +
            " userId        TEXT        NOT NULL)";

    private final static String CREATE_TABLE_DASHBOARD_USERS = "CREATE TABLE  IF NOT EXISTS dashboard_users" +
            "(username          TEXT        PRIMARY KEY, " +
            "password           TEXT        NOT NULL, " +
            "name               TEXT        NOT NULL, " +
            "surname            TEXT        NOT NULL, " +
            "email              TEXT        NOT NULL," +
            "isAdmin            BOOLEAN     NOT NULL," +
            "keystoneId         TEXT)";

    private Connection openConnection() throws ClassNotFoundException, SQLException {
        Class.forName("org.sqlite.JDBC");
        String dbPath = LoadConfiguration.configuration.get("DASHBOARD_DB_PATH");
        return DriverManager.getConnection("jdbc:sqlite:" + dbPath);
    }

    /**
     * This method is the one who ensures that the database is created, and in case it's not, creating it.
     *
     * @throws DatabaseInteractionException
     */
    public void createDatabaseIfNotExists() throws DatabaseInteractionException {
        try {
            logger.trace("Creating Database Tables if doesn't exists");
            Connection c = openConnection();
            Statement stmt = c.createStatement();
            stmt.executeUpdate(CREATE_TABLE_BILLS);
            stmt.executeUpdate(CREATE_TABLE_METER_SOURCE);
            stmt.executeUpdate(CREATE_TABLE_EXTERNAL_ID);
            stmt.executeUpdate(CREATE_TABLE_GATEKEEPER_USERS);
            stmt.executeUpdate(CREATE_TABLE_DASHBOARD_USERS);
            stmt.close();
            c.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while trying to create the tables in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while trying to create the tables in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method adds a bill to the database for a user with username @userId
     *
     * @param userId
     * @param pdfPath
     * @param bill
     * @throws DatabaseInteractionException
     */
    public void addBill(String userId, String pdfPath, Bill bill) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to add the bill to the database.");
            Connection c = openConnection();
            String sql = "INSERT INTO bills (ID, userId, billPDF, fromDate, toDate, dueDate) VALUES (NULL, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = c.prepareStatement(sql);
            stmt.setString(1, userId);
            stmt.setString(2, pdfPath);
            stmt.setString(3, bill.getFromDate());
            stmt.setString(4, bill.getToDate());
            stmt.setString(5, bill.getDueDate());
            logger.debug("Statement attempting to be executed: " + sql);
            stmt.executeUpdate();
            c.close();

        } catch (ClassNotFoundException e) {
            logger.error("Error while adding a Bill in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while adding a Bill in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns a list of all the bills that a user with username @userId has
     *
     * @param userId
     * @param allBills
     * @return List<Bill>
     * @throws DatabaseInteractionException
     */
    public List<Bill> getBillsForUser(String userId, String allBills) throws DatabaseInteractionException {
        List<Bill> bills = new ArrayList<Bill>();
        boolean showAllbills;
        try {
            logger.trace("Attempting to get the Bills for a User.");
            Connection c = openConnection();
            PreparedStatement stmt;
            String sql;
            if (allBills.equals("true")){
                showAllbills = true;
                sql = "SELECT * FROM bills WHERE userId = ? AND approved = ?";
                stmt = c.prepareStatement(sql);
                stmt.setString(1, userId);
                stmt.setBoolean(2, showAllbills);
            }
            else{
                sql = "SELECT * FROM bills WHERE userId = ?";
                stmt = c.prepareStatement(sql);
                stmt.setString(1, userId);
            }

            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = stmt.executeQuery();

            while (resultSet.next()) {
                Bill bill = new Bill();
                bill.setFromDate(resultSet.getString("fromDate"));
                bill.setToDate(resultSet.getString("toDate"));
                bill.setDueDate(resultSet.getString("dueDate"));
                bill.setApproved(resultSet.getInt("approved") != 0);
                bill.setPaid(resultSet.getInt("paid") != 0);
                bills.add(bill);
            }

            c.close();

            return bills;
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting Bill's from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting Bill's from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (ParseException e) {
            logger.error("Error while getting Bill's from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method gets all the External User Ids and returns them in a list.
     *
     * @param userId
     * @param meters
     * @param actives
     * @return List<ExternalUserId>
     * @throws DatabaseInteractionException
     */
    public List<ExternalUserId> getExternalUserIds(String userId, ArrayList<String> meters, boolean actives) throws DatabaseInteractionException {
        List<ExternalUserId> result = new ArrayList<ExternalUserId>();
        try {
            logger.trace("Attempting to get the external Ids.");
            Connection c = openConnection();
            PreparedStatement stmt;
            String sql = "SELECT source, meterUserId FROM  meter_source LEFT JOIN (SELECT * FROM external_id WHERE userId = ?) ON meterSourceId = meter_source.ID" ;
            stmt = c.prepareStatement(sql);
            for (String meter : meters) {
                stmt.setString(1, userId);
                logger.debug("Statement attempting to be executed: " + sql);
                ResultSet resultSet = stmt.executeQuery();

                while (resultSet.next()) {
                    result.add(new ExternalUserId(resultSet.getString(1), resultSet.getString(2)));
                }
            }

            c.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting External IDs from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting External IDs from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }

        return result;
    }

    /**
     * This method updates the existing ExternalUserIds
     *
     * @param userId
     * @param externalUserIds
     * @throws DatabaseInteractionException
     */
    public void updateExternalUserIds(String userId, List<ExternalUserId> externalUserIds) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to update the External IDs in the database.");
            Connection c = openConnection();

            //TODO: use database transactions

            //Remove existing items
            String delsql = "DELETE FROM external_id WHERE userId = ?";
            PreparedStatement delStmt = c.prepareStatement(delsql);
            delStmt.setString(1, userId);
            logger.debug("Statement attempting to be executed: " + delsql);
            delStmt.executeUpdate();

            //Add all newly submitted entries
            String inssql = "INSERT INTO external_id SELECT null, ?, meter_source.ID, ? FROM meter_source WHERE meter_source.source = ?" ;
            PreparedStatement insStmt = c.prepareStatement(inssql);

            for (ExternalUserId exId : externalUserIds) {
                insStmt.setString(1, userId);
                insStmt.setString(2, exId.getUserId());
                insStmt.setString(3, exId.getSource());
                insStmt.addBatch();
            }

            logger.debug("Statement attempting to be executed: " + inssql);
            insStmt.executeBatch();
            c.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while updating External IDs in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while updating External IDs in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method adds an external meter source to the database.
     *
     * @param meterSource
     * @throws DatabaseInteractionException
     */
    public void addExternalMeterSource(String meterSource) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to add external meters sources in the database.");
            Connection c = openConnection();

            //TODO: use database transactions

            //Check if source already exists in the DB
            String selsql = "SELECT * FROM meter_source WHERE source = ?";
            PreparedStatement selStmt = c.prepareStatement(selsql);
            selStmt.setString(1, meterSource);

            logger.debug("Statement attempting to be executed: " + selsql);
            ResultSet resultSet = selStmt.executeQuery();
            boolean existsSource = resultSet.isBeforeFirst();

            if (!existsSource) {
                String inssql = "INSERT INTO meter_source VALUES (NULL, ?)";
                PreparedStatement insStmt = c.prepareStatement(inssql);
                insStmt.setString(1, meterSource);
                logger.debug("Statement attempting to be executed: " + inssql);
                insStmt.executeUpdate();
            }

            c.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while Adding a external meter in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while Adding a external meter in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method checks if there is some bill like @bill for a user with username @userId
     *
     * @param userId
     * @param bill
     * @return boolean
     * @throws DatabaseInteractionException
     */
    public boolean existsBill(String userId, Bill bill) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to check if a bill exists the database.");
            Connection c = openConnection();
            String sql = "SELECT * FROM bills WHERE userId = ? AND fromDate = ? AND toDate = ?";
            PreparedStatement stmt = c.prepareStatement(sql);
            stmt.setString(1, userId);
            stmt.setString(2, bill.getFromDate());
            stmt.setString(3, bill.getToDate());
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = stmt.executeQuery();
            boolean hasBills = resultSet.isBeforeFirst();
            c.close();
            return hasBills;
        } catch (ClassNotFoundException e) {
            logger.error("Error while checking a Bill in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while checking a Bill in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method gets the bill path from the database.
     *
     * @param userId
     * @param bill
     * @return String
     * @throws DatabaseInteractionException
     */
    public String getBillPath(String userId, Bill bill) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to get the bill's path from the database.");
            Connection c = openConnection();
            String sql = "SELECT billPDF FROM bills WHERE userId = ? AND fromDate = ? AND toDate = ?";
            PreparedStatement stmt = c.prepareStatement(sql);
            stmt.setString(1, userId);
            stmt.setString(2, bill.getFromDate());
            stmt.setString(3, bill.getToDate());
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = stmt.executeQuery();

            if (resultSet.next()) {
                String pdfPath = resultSet.getString("billPDF");
                c.close();
                return pdfPath;
            } else {
                c.close();
                throw new DatabaseInteractionException("No rows found");
            }

        } catch (ClassNotFoundException e) {
            logger.error("Error while getting Bill's information from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting Bill's information from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method adds a link between the username from the dashboard and the cloudsfoundry
     * userID in the users table.
     *
     * @param username
     * @param keystoneId
     * @throws DatabaseInteractionException
     */
    public void
    addKeystoneId(String username, String keystoneId) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to add a Keystone ID in the database.");
            Connection connection = openConnection();
            String sql = "UPDATE dashboard_users SET keystoneId = ? WHERE username = ?";
            PreparedStatement pstm = connection.prepareStatement(sql);
            pstm.setString(1, keystoneId);
            pstm.setString(2, username.toUpperCase());
            logger.debug("Statement attempting to be executed: " + sql);
            pstm.execute();
            connection.close();
        } catch (SQLException e) {
            logger.error("Error while adding a Keystone Id in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (ClassNotFoundException e) {
            logger.error("Error while adding a Keystone Id in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method registers a new User on the dashboard_users table on our database, linking the
     * user account with the name and all the information.
     *
     * @param username
     * @param password
     * @param name
     * @param surname
     * @param email
     * @throws DatabaseInteractionException
     */
    public void registerUser(String username, String password, String name, String surname, String email, String isAdmin) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to register a new user in the database.");
            Connection connection = openConnection();
            String sql = "INSERT INTO dashboard_users(username, password, name, surname, email, isadmin) VALUES(?,?,?,?,?,?)";
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, username.toUpperCase());
            statement.setString(2, password);
            statement.setString(3, name);
            statement.setString(4, surname);
            statement.setString(5, email);

            if (isAdmin.equalsIgnoreCase("y"))
                statement.setBoolean(6, true);
            else
                statement.setBoolean(6, false);

            logger.debug("Statement attempting to be executed: " + sql);
            statement.execute();
            connection.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while Inserting User Info into the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while Inserting User Info into the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method will check if this user and password are corrects
     *
     * @param name
     * @param password
     * @param dbname
     * @return
     * @throws DatabaseInteractionException
     */
    public boolean existsUser(String name, String password, String dbname) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Check if a user exists in the database.");
            Connection connection = openConnection();
            String sql = "SELECT * FROM " + dbname + " WHERE username=? AND password=?";
            PreparedStatement pstm = connection.prepareStatement(sql);
            pstm.setString(1, name.toUpperCase());
            pstm.setString(2, password);
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = pstm.executeQuery();
            connection.close();
            return resultSet.next();
        } catch (ClassNotFoundException e) {
            logger.error("Error while checking Users in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while checking Users in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error while checking Users in the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method inserts a new user on the database linked to his userId
     *
     * @param username
     * @param password
     * @param userId
     * @throws DatabaseInteractionException
     */
    public void registerOnGK(String username, String password, String userId) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Register a User in the database.");
            Connection connection = openConnection();
            String sql = "INSERT INTO gatekeeper_users(username, password, userId) VALUES(?,?,?)";
            PreparedStatement pstm = connection.prepareStatement(sql);
            pstm.setString(1, username.toUpperCase());
            pstm.setString(2, password);
            pstm.setString(3, userId);
            logger.debug("Statement attempting to be executed: " + sql);
            pstm.execute();
            connection.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while Inserting User Info into the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while Inserting User Info into the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns the UserId from a the username passed as a parameter.
     *
     * @param username
     * @return String
     * @throws DatabaseInteractionException
     */
    public String getUserId(String username) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Get User ID from the database");
            Connection connection = openConnection();
            String sql = "SELECT userId FROM gatekeeper_users WHERE username =?";
            PreparedStatement pstm = connection.prepareStatement(sql);
            pstm.setString(1, username.toUpperCase());
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = pstm.executeQuery();
            String userId = resultSet.getString("userId");
            connection.close();
            return userId;
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting a User Id from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting a User Id from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns the keystoneId of a user with username @username.
     *
     * @param username
     * @return String
     * @throws DatabaseInteractionException
     */
    public String getKeystoneId(String username) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Get a Keystone Id from the database");
            Connection connection = openConnection();
            String sql = "SELECT keystoneId FROM dashboard_users WHERE username =?";
            PreparedStatement pstm = connection.prepareStatement(sql);
            pstm.setString(1, username.toUpperCase());
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = pstm.executeQuery();
            String keystoneId = resultSet.getString("keystoneId");
            connection.close();
            return keystoneId;
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting a Keystone Id from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);

        } catch (SQLException e) {
            logger.error("Error while getting a Keystone Id from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method checks if the user with username @username is admin or not. In the future we will decide if we will implement the
     * admin check with the Gatekeeper information using the API.
     * @param username
     * @return boolean
     * @throws DatabaseInteractionException
     */
    public boolean isAdmin(String username) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Check if a user is an Admin from the database");
            Connection connection = openConnection();
            String sql = "SELECT isAdmin FROM dashboard_users WHERE username =?";
            PreparedStatement pstm = connection.prepareStatement(sql);
            pstm.setString(1, username.toUpperCase());
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = pstm.executeQuery();
            boolean isAdmin = resultSet.getBoolean("isAdmin");
            connection.close();
            return isAdmin;
        } catch (ClassNotFoundException e) {
            logger.error("Error while checking User info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while checking User info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns a representation of the non-admin users.
     *
     * @return Representation
     * @throws DatabaseInteractionException
     */
    public Representation getUsers() throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Get the users from the database");
            ArrayList<String> users = new ArrayList<String>();
            Connection connection = openConnection();
            String sql = "SELECT username FROM dashboard_users WHERE isAdmin=0";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                int i = 1;
                while (i <= resultSet.getMetaData().getColumnCount()) {
                    users.add(resultSet.getString(i++));
                }
            }
            logger.trace("Creating a Representation for returning all the Users");
            int i = 0;
            JSONObject jsonObject = new JSONObject();
            for (String user : users) {
                jsonObject.put("user" + i, user);
                i++;
            }

            JsonRepresentation jsonRepresentation = new JsonRepresentation(jsonObject);
            connection.close();
            return jsonRepresentation;
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting User Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting User Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (JSONException e) {
            logger.error("Error while getting User Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns a representation of the admin users.
     *
     * @return Representation
     * @throws DatabaseInteractionException
     */
    public Representation getAdmins() throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Get the admins from the database");
            ArrayList<String> admins = new ArrayList<String>();
            Connection connection = openConnection();
            String sql = "SELECT username FROM dashboard_users WHERE isAdmin=1";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                int i = 1;
                while (i <= resultSet.getMetaData().getColumnCount()) {
                    admins.add(resultSet.getString(i++));
                }
            }

            logger.trace("Creating a Representation for returning all the Admins");
            int i = 0;
            JSONObject jsonObject = new JSONObject();
            for (String admin : admins) {
                jsonObject.put("admin" + i, admin);
                i++;
            }

            JsonRepresentation jsonRepresentation = new JsonRepresentation(jsonObject);
            connection.close();
            return jsonRepresentation;
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting Admins from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting Admins from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (JSONException e) {
            logger.error("Error while getting Admins from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns a representation of all the users, whether they are admins or not.
     *
     * @return Representation
     * @throws DatabaseInteractionException
     */
    public Representation getAllUsers() throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Get All the users from the database");
            ArrayList<String> users = new ArrayList<String>();
            Connection connection = openConnection();
            String sql = "SELECT username FROM dashboard_users";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                int i = 1;
                while (i <= resultSet.getMetaData().getColumnCount()) {
                    users.add(resultSet.getString(i++));
                }
            }

            logger.trace("Creating a Representation for returning All the Users and Admins");
            int i = 0;
            JSONObject jsonObject = new JSONObject();
            for (String user : users) {
                jsonObject.put("user" + i, user);
                i++;
            }

            JsonRepresentation jsonRepresentation = new JsonRepresentation(jsonObject);
            connection.close();
            return jsonRepresentation;
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting Users from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting Users from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (JSONException e) {
            logger.error("Error while getting Users from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method gives to a user admin rights. In the future we will decide if we will implement the
     * admin check with the Gatekeeper information using the API.
     *
     * @param username
     * @param isAdmin
     * @throws DatabaseInteractionException
     */
    public void promoteUser(String username, int isAdmin) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to promote a user the database");
            Connection connection = openConnection();
            String sql = "UPDATE dashboard_users SET isAdmin=? WHERE username=?";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, isAdmin);
            preparedStatement.setString(2, username);
            logger.debug("Statement attempting to be executed: " + sql);
            preparedStatement.executeUpdate();
            connection.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while promoting a User the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while promoting a User the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method returns the info of a user with username @username
     *
     * @param username
     * @return Representation
     * @throws DatabaseInteractionException
     */
    public Representation getUserInfo(String username) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Get user information from the database");
            Connection connection = openConnection();
            String sql = "SELECT d.name, d.surname, d.keystoneId, g.userId FROM dashboard_users d " +
                    "JOIN gatekeeper_users g ON d.username = g.username WHERE d.username =?";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setString(1, username);
            logger.debug("Statement attempting to be executed: " + sql);
            ResultSet resultSet = preparedStatement.executeQuery();
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("name", resultSet.getString("name"));
            jsonObject.put("surname", resultSet.getString("surname"));
            jsonObject.put("keystoneId", resultSet.getString("keystoneId"));
            jsonObject.put("userId", resultSet.getString("userId"));
            connection.close();
            return new JsonRepresentation(jsonObject);
        } catch (ClassNotFoundException e) {
            logger.error("Error while getting User Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while getting User Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (JSONException e) {
            logger.error("Error while getting User Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }

    /**
     * This method updates the information the bill from @from to @to of @userId.
     * This method will be the one that changes the status of the bill (paid or not paid and approved or not)
     *
     * @param userId
     * @param from
     * @param to
     * @param approved
     * @param paid
     * @throws DatabaseInteractionException
     */
    public void updateBillStatus(String userId, String from, String to, boolean approved, boolean paid) throws DatabaseInteractionException {
        try {
            logger.trace("Attempting to Update Bill Info from the database");
            Connection connection = openConnection();
            String sql = "UPDATE Bills SET approved=? , paid=? WHERE userId=? AND fromDate=? AND toDate=?";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setBoolean(1, approved);
            preparedStatement.setBoolean(2, paid);
            preparedStatement.setString(3, userId);
            preparedStatement.setString(4, from);
            preparedStatement.setString(5, to);
            preparedStatement.executeUpdate();
            connection.close();
        } catch (ClassNotFoundException e) {
            logger.error("Error while Updating Bill Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        } catch (SQLException e) {
            logger.error("Error while Updating Bill Info from the database: " + e.getMessage());
            throw new DatabaseInteractionException(e.getMessage(), e);
        }
    }
}