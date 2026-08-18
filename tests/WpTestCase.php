<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests;

use PHPUnit\Framework\TestCase;
use WorDBless\Sqlite;

// phpcs:disable Inpsyde.CodeQuality.NoAccessors.NoSetter

class WpTestCase extends TestCase
{
    /** @var array<string, int> */
    private static array $users = [];

    private static bool $userIsLoggedIn = false;

    public static function setUpBeforeClass(): void
    {
        self::setUpWordBless();
        parent::setUpBeforeClass();
    }

    public static function tearDownAfterClass(): void
    {
        self::tearDownWordBless();
        parent::tearDownAfterClass();
    }

    public static function setUpWordBless(): void
    {
        WpLoad::load();
    }

    public static function tearDownWordBless(): void
    {
        if (self::$userIsLoggedIn) {
            wp_logout();
            self::$userIsLoggedIn = false;
        }
    }

    protected function setUp(): void
    {
        parent::setUp();
        Sqlite::init();
        self::insertUsers();
        self::insertPosts();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        self::cleanUp();
    }

    protected function signInUser(string $name): void
    {
        $id = (int) (self::$users[$name] ?? null);
        // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        $id or throw new \InvalidArgumentException("User '{$name}' not found");
        $currentUser = wp_signon([
            'user_login' => $name,
            'user_password' => 'password',
            'remember' => false,
        ]);
        // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
        $currentUser or throw new \RuntimeException("Unable to set current user to '{$name}'");
        wp_set_current_user($id, $name);
        self::$userIsLoggedIn = true;
    }

    private static function insertUsers(): void
    {
        $result = wp_insert_user([
            'user_login' => 'subscriber',
            'user_pass' => 'password',
            'user_email' => 'subscriber@test.com',
            'role' => 'subscriber',
        ]);

        if ($result instanceof \WP_Error) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new \RuntimeException('Unable to create user: ' . $result->get_error_message());
        }

        self::$users['subscriber'] = (int) $result;
    }

    private static function insertPosts(): void
    {
        wp_insert_post(
            [
                'post_title' => 'Test Post',
                'post_name' => 'test-post',
                'post_content' => 'Test Content',
                'post_status' => 'publish',
                'post_type' => 'post',
                'post_date' => '2023-01-01 12:00:00',
            ],
        );
    }

    private static function cleanUp(): void
    {
        global $wpdb;

        $tables = [
            'commentmeta',
            'comments',
            'links',
            'options',
            'postmeta',
            'posts',
            'term_relationships',
            'term_taxonomy',
            'termmeta',
            'terms',
            'usermeta',
            'users',
        ];

        foreach ($tables as $table) {
            $fullTable = $wpdb->prefix . $table;

            // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("DELETE FROM {$fullTable}");
            // phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        }

        wp_cache_flush();
    }
}
