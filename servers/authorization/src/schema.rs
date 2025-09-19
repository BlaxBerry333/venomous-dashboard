// @generated automatically by Diesel CLI.

diesel::table! {
    auth_users (id) {
        id -> Uuid,
        user_id -> Uuid,
        email -> Varchar,
        password_hash -> Varchar,
        email_verified -> Bool,
        last_login -> Nullable<Timestamptz>,
        failed_login_attempts -> Int4,
        account_locked_until -> Nullable<Timestamptz>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    permissions (id) {
        id -> Uuid,
        name -> Varchar,
        resource -> Varchar,
        action -> Varchar,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    role_permissions (role_id, permission_id) {
        role_id -> Uuid,
        permission_id -> Uuid,
    }
}

diesel::table! {
    roles (id) {
        id -> Uuid,
        name -> Varchar,
        description -> Nullable<Text>,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    user_profiles (id) {
        id -> Uuid,
        user_id -> Uuid,
        bio -> Nullable<Text>,
        phone -> Nullable<Varchar>,
        company -> Nullable<Varchar>,
        website -> Nullable<Varchar>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    user_roles (user_id, role_id) {
        user_id -> Uuid,
        role_id -> Uuid,
        assigned_at -> Timestamptz,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        email -> Varchar,
        name -> Varchar,
        avatar -> Nullable<Text>,
        locale -> Varchar,
        timezone -> Nullable<Varchar>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::joinable!(auth_users -> users (user_id));
diesel::joinable!(role_permissions -> permissions (permission_id));
diesel::joinable!(role_permissions -> roles (role_id));
diesel::joinable!(user_profiles -> users (user_id));
diesel::joinable!(user_roles -> roles (role_id));
diesel::joinable!(user_roles -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    auth_users,
    permissions,
    role_permissions,
    roles,
    user_profiles,
    user_roles,
    users,
);
