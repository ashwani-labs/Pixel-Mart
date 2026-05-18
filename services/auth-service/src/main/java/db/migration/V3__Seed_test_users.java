package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.PreparedStatement;
import java.util.UUID;

public class V3__Seed_test_users extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        insertUser(context, UUID.randomUUID().toString(), "admin@pixelmart.local", encoder.encode("Admin@123"), "PixelMart Admin", "ADMIN");
        insertUser(context, UUID.randomUUID().toString(), "customer@pixelmart.local", encoder.encode("Customer@123"), "Test Customer", "CUSTOMER");
    }

    private void insertUser(Context context, String id, String email, String hash, String name, String role) throws Exception {
        try (PreparedStatement user = context.getConnection().prepareStatement(
                "INSERT INTO users (id, email, password_hash, name, enabled) VALUES (?, ?, ?, ?, TRUE)")) {
            user.setString(1, id);
            user.setString(2, email);
            user.setString(3, hash);
            user.setString(4, name);
            user.executeUpdate();
        }
        try (PreparedStatement roleStmt = context.getConnection().prepareStatement(
                "INSERT INTO user_roles (user_id, role) VALUES (?, ?)")) {
            roleStmt.setString(1, id);
            roleStmt.setString(2, role);
            roleStmt.executeUpdate();
        }
    }
}
