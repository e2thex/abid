<?php 
  $db = $_GET['db'];
if($_GET['data']) {
  header('Cache-Control: no-cache, must-revalidate');
  header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
  header('Content-type: application/json');
  if(file_exists("data/$db.json")) {
    $data = file_get_contents("data/$db.json");

    print $data;
    exit;
  }
  else {
    print '[]';
    exit;
  }
}
if($data = $_POST['data']) {
  file_put_contents("data/$db.json", json_encode($data));
  exit;
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ABID</title>
  <meta name="description" content="ABID: ABID, Bidding is Deciding" />
  <script src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'></script>
  <script src = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js'></script>
  <script src = 'aspot/lib/aspot.js'></script>
  <script src = './hia.js'></script>
  <script src = './abid.js'></script>
  <script src = './tablesorter/jquery.tablesorter.js'></script>
  <link rel="stylesheet" href="./abid.css">
  <link rel="stylesheet" href="./blue.style.css">

  <!-- Set the viewport width to device width for mobile -->
  <meta name="viewport" content="width=device-width" />
  <!-- Included CSS Files (Uncompressed) -->
  <!--
  <link rel="stylesheet" href="stylesheets/foundation.css">
  -->
  <!-- Included CSS Files (Compressed) -->
  <link rel="stylesheet" href="stylesheets/foundation.min.css">
  <link rel="stylesheet" href="stylesheets/app.css">
  <script src="javascripts/modernizr.foundation.js"></script>
  <!-- IE Fix for HTML5 Tags -->
  <!--[if lt IE 9]>
  <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
  <![endif]-->

</head>
<body>
<!-- Basic Needs -->
<nav class="top-bar">
  <ul>
    <li class="name"><h1><a href="#">Phase2 ABID</a></h1></li>
    <li class="toggle-topbar"><a href="#"></a></li>
  </ul>
  <section>
    <ul class="left">
    </ul>

    <ul class="right">
    </ul>
  </section>
</nav>

<ul class="breadcrumbs">
  <li></li>
  <li><a class ="bc-home" href="#">Home</a></li>
</ul>
<div class = "row">
  <div class = "workarea twelve columns panel"></div>
</div>

</body>
<script>
dbname = '<?php print $_GET['db']?>';
</script>
