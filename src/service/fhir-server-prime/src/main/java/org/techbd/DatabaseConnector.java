package org.techbd;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnector {
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/postgres";
    private static final String USER = "postgres";
    private static final String PASSWORD = "postgres"; // Use an empty string if no password is set

    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static Connection connect() throws SQLException {
        return DriverManager.getConnection(DB_URL, USER, PASSWORD);
    }

    public static void disconnect(Connection connection) throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
}
