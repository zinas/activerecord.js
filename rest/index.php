<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require_once 'meekrodb.class.php';
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, `Slim::patch`, and `Slim::delete`
 * is an anonymous function.
 */

// GET route
$app->get(
    '/',
    function () {
        echo "Dummy REST API for activerecord.js";
    }
);

$app->get(
    '/cars',
    function () {
        $columns = array('id', 'brand', 'model', 'year', 'cost');
        // Get a list of cars
        $mdb = new MeekroDB();
        $query = "SELECT * FROM cars WHERE 1 ";

        foreach ($columns as $column) {
            if ($_GET[$column]) {
                $query .= " AND `".$column."` = '".$_GET[$column]."' ";
            }
        }

        if ($_GET['limit']) {
            $query .= " LIMIT ".$_GET['limit']." ";
        }

        echo json_encode($mdb->query($query));
    }
);

$app->get(
    '/cars/:id',
    function ($id) {
        $mdb = new MeekroDB();
        echo json_encode($mdb->query("SELECT * FROM cars WHERE id=".$id));
    }
);



// POST route
$app->post(
    '/cars',
    function () {
        // add a new car to the collection
        $mdb = new MeekroDB();
        $mdb->insert('cars', $_POST);
    }
);
$_PUT = $app->request->params();

// PUT route
$app->put(
    '/cars/:id',
    function ($id) use ($_PUT) {
        $columns = array('id', 'brand', 'model', 'year', 'cost');
        // Get a list of cars
        $mdb = new MeekroDB();
        $params = array();
        foreach ($columns as $column) {
            if ($_PUT[$column]) {
                $params[] = "`".$column."` = '".$_PUT[$column]."'";
            }
        }

        $query = "UPDATE cars SET ".implode(',', $params)." WHERE id=".$id;
        echo json_encode($mdb->query($query));
    }
);

// DELETE route
$app->delete(
    '/delete/:id',
    function ($id) {
        // remove a car from the collection
    }
);

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();
