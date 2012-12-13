abid = function (db){
  setupData(db);
  abid.addActionHolder(db,"Reports", 'reports');
  abid.addActionHolder(db,"Admin", 'admin', 'right');
  abid.addAction(db,'admin', 'Save', function(e) {
    var out = Object.keys(db.store).map(function(key) { var i = db.store[key]; return {subject:i.subject, predicate:i.predicate, object:i.object}});
    $.post("index.php?db="+dbname, {data:out})
    return false;
  });
  abid.addAction(db, 'left', 'Add Project', function(e) {
    $(".details").html("");
    var datum = db.datum(aspot.uuid());
    datum.attr('is_a').value =  'project';
    return abid.theme.fullProject(datum);
  });
  abid.addAction(db, 'reports', "All Projects", function(e) {
    var query = '[."is_a" = "project"]';
    var userRatio = db.datum("session").attr("currentUser").attr("r_o_ratio").value;
    table = theme.report(
      db,
      query, 
      ['Title', 'Summary', 'Revenue Offer', 'Offset Offer', 'Net Score'], 
      [
        function (d) { return abid.theme.loadProjectLink(d, d.attr('title').value); },
        function (d) { return abid.theme.loadProjectLink(d, d.attr('summary').value); },
        function (d) {  
          return '$' + abid.theme.sum(d.db.query('[.<"offer" = "'+d.value+'" AND ."type" = "revenue"]."amount"')).value;
        },
        function (d) {  
          return '$' + abid.theme.sum(d.db.query('[.<"offer" = "'+d.value+'" AND ."type" = "offset"]."amount"')).value;
        },
        function (d) {
          var totalR =  abid.theme.sum(d.db.query('[.<"offer" = "'+d.value+'" AND ."type" = "revenue"]."amount"')).value;
          var totalO = abid.theme.sum(d.db.query('[.<"offer" = "'+d.value+'" AND ."type" = "offset"]."amount"')).value;
          var est = abid.theme.sum(d.db.query('[.<"estimate" = "'+d.value+'" AND ."owner" = "'+ db.datum("session").attr("currentUser").value +'"]."amount"')).value;
          console.log({t:d.attr("title").value,r:totalR, o:totalO, e:est});
          if(est) {
            return userRatio ? (totalR * userRatio*1 + totalO*1)/est : "";
          }
          else {
            return "";
          }
        }
      ]
    );
    return table;
  });
  abid.addAction(db, 'admin', "All Users", function(e) {
    var query = '[."is_a" = "user"]';
    table = theme.report(
      db,
      query, 
      ['User id', "R/O ratio"], 
      [
        function (d) { return theme.edit.contenteditable(d, "" ); },
        function (d) { return theme.edit.contenteditable(d.attr("r_o_ratio"), "" ); },
      ]
    );
    table.tablesorter();
    return table;
  });

  abid.addAction(db, 'admin', "Users", function(e) {
    var tag = theme.isAList(db, "user");
    return tag;
  });
  abid.addAction(db,'right', '<div class = "current-user"></div>', function(e) { return false;
  });
  $(".current-user").append(theme.dropdown.query(session.attr("currentUser"), "Current User: ", '[."is_a" = "user"]'));
  $(".bc-home").click(function(){
    $(this).parent("li").addClass("current").nextAll().remove();
    $(".workarea").html("");
  });
}
abid.theme = {};

abid.theme.fullOffers = function(datum) {
  offers = theme.element("div",["offers"]);
  
  datum.forEach(function (offer) {
    
  });
  if(datum.attr('offer').value) {
    $.each(datum.attr('offer'), function() {
      offers.append(abid.theme.offer(this))
    })
  }
}
abid.theme.fullOffer = function(datum) {
  var tag = theme.element('div',["offer"]);
  tag.append(theme.element('div', [], datum.attr(type), 'Type: ', ['Revenue', 'Offset']));
  tag.append(theme.edit.contenteditable(datum[0].attr('offerer'), 'Offerer: '));
  tag.append(theme.edit.contenteditable(datum[0].attr('amount'), 'Amount: $'));
}
abid.theme.FullOfferEdit = function(datum) {
  if(!datum.value) {
    datum[0].value = aspot.uuid(); 
  }
  var tag = theme.element('div',["offer"]);
  tag.append(theme.edit.dropdown(datum[0].attr('type'), 'Type: ', ['Revenue', 'Offset']));
  tag.append(theme.edit.contenteditable(datum[0].attr('offerer'), 'Offerer: '));
  tag.append(theme.edit.contenteditable(datum[0].attr('amount'), 'Amount: $'));
  return tag;
}
abid.theme.fullProject = function(datum) {
  if(!datum.value) {
    datum.value = aspot.uuid(); 
  }
  var tag = theme.element('div',["project", "row"]);
  var main = theme.element("div", ['six', "columns"]);
  var second = theme.element("div", ['three', "columns"]);
  var meta =  theme.element("div", ['three', 'columns']);
  main.append(theme.edit.contenteditable(datum.attr('title'), 'Title: '));
  main.append(theme.edit.contenteditable(datum.attr('summary'), 'Summary: '));
  main.append(theme.edit.contenteditable(datum.attr('requirements'), 'Requirements: '));
  main.append(theme.dropdown.query(datum.attr('proposed_by'),"Proposed By: ", '[."is_a" = "user"]')); 
  main.append(theme.dropdown.query(datum.attr('type'),"Type: ", '[."is_a" = "project_type"]')); 
  var haveCurrentUser = false;
  var current = datum.db.datum('session').attr('currentUser').value;
  var roffer = abid.getOfferByUser(datum, current, 'revenue');
  second.append(theme.edit.contenteditable(roffer.attr('amount'), 'Your Revenue Offer: $'));
  var ooffer = abid.getOfferByUser(datum, current, 'offset');
  second.append(theme.edit.contenteditable(ooffer.attr('amount'), 'Your Offset Offer: $'));
  var est = abid.getEstimateByUser(datum, current);
  second.append(theme.edit.contenteditable(est.attr('amount'), 'Your Estimate: '));
  meta.append(
    theme.display.simple(
      abid.theme.sum(datum.db.query('[.<"offer" = "'+datum.value+'" AND ."type" = "revenue"]."amount"')),
      'Total Revenue Offer: $'
    )
  );
  meta.append(
    theme.display.simple(
      abid.theme.sum(datum.db.query('[.<"offer" = "'+datum.value+'" AND ."type" = "offset"]."amount"')),
      'Total Offset Offer: $'
    )
  );
  tag.append(main).append(second).append(meta);

  return tag;
}

abid.getEstimateByUser = function(datum, currentUser) {
  var estResult = datum.db.query('[.<"estimate" = "'+datum.value+'"][."owner" = "' + datum.db.datum('session').attr("currentUser").value + '"]');
  var est = false;
  if(estResult.length) {
    est = estResult[0];
  }
  else {
    est = datum.attr("estimate").new();
    est.value = aspot.uuid();
    est.attr("owner").value = currentUser;
    est.attr("is_a").value = "estimate";
  }
  return est;
}
abid.getOfferByUser = function(datum, currentUser, type) {
  var offerResult = datum.db.query('[.<"offer" = "'+datum.value+'"][."offerer" = "' + datum.db.datum('session').attr("currentUser").value + '" AND ."type" = "'+type+'"]');
  var offer = false;
  if(offerResult.length) {
    offer = offerResult[0];
  }
  else {
    offer = datum.attr("offer").new();
    offer.value = aspot.uuid();
    offer.attr("type").value = type;
    offer.attr("offerer").value = currentUser;
  }
  return offer;

}
abid.theme.loadProjectLink = function(datum, value) {
  var tag = theme.element("a", ['load-project']);
  tag.html(value);
  var datum = datum;
  tag.click(function(e) {
    abid.action.do(datum.attr("title").value, function(){return abid.theme.fullProject(datum);}, e);
  });
  return tag;
}
abid.theme.sum = function (query_results) {
  query_results.push({value:0});
  query_results.push({value:0});
  var rtn = query_results.reduce(function(pV, cV, index, array) { 
    return {value :pV.value*1 + cV.value*1} ;
  });
  rtn.value = isNaN(rtn.value) ? 0 : rtn.value;
  return rtn;
}
abid.action = {};
abid.action.do = function(name, callback, event) {
  var bc = theme.element("a", [], name);
  var new_content = callback(event);
  if(!new_content) {
    return;
  }
  function trans(currentContent, direction) {
    var current = theme.element("div", ['current']);
    var wa = $(".workarea");
    var old = wa.find(".current");
    old.removeClass("current").addClass("old");
    current.append(currentContent).hide();
    wa.append(current);
    odirection = direction == 'left' ? 'right':'left';
    var time = 400;
    old.hide("slide", {direction:direction}, time, function() { old.remove(); });
    current.show("slide", {direction:odirection}, time);
    //old.remove();
  }
  bc.click(function(e) {
    var dirc = $(this).parent().nextAll().is(".current") ? 'right' : 'left';
    trans(callback(e), dirc);
    $(".breadcrumbs").find('li').removeClass("current");
    $(this).parent('li').addClass("current");
 
  });
  trans(new_content, 'left');
  var li = theme.element('li', [], bc);
  $(".breadcrumbs").find('li.current').nextAll().remove();
  $(".breadcrumbs").find('li').removeClass("current");
  li.addClass("current");
  $(".breadcrumbs").append(li);
}

abid.addActionHolder = function (db,name, id, parent) {
  parent = typeof parent == 'undefined' ? 'left' : parent;
  var menu_identifier = ".top-bar ." + parent;
  var itemlabel = theme.element("a", [], name);
  var itemul = theme.element("ul", [id, "dropdown"]);
  var item = theme.element("li",["has-dropdown"]);
  item.append(itemlabel).append(itemul);
  $(menu_identifier).append(item);
}
abid.addAction = function (db, parent, name, callback) {
  var menu_identifier = ".top-bar ." + parent;
  var item = theme.element("a", [], name);
  item.click(function (e) {
    abid.action.do(name, callback,e);
  });
  $(menu_identifier).append(theme.element('li', [], item));
}
pullData = function() {
  var db = {};
  $.getJSON("index.php?db="+dbname+"&data=true", function(data) {
    db = aspot.localDB(data)
    abid(db);
  });
}
$(function() {
  //db = aspot.localDB();
  db = pullData();
  //setupData();
});

var setupData = function(db) {
  /*
  a = db.datum(aspot.uuid());
  a.attr('is_a').value = 'project';
  a.attr('title').value = 'project a';
  a.attr('summary').value = 'project a desc';
  a.attr('requirements').value = 'project a req';
  b = db.datum(aspot.uuid());
  b.attr('is_a').value = 'project';
  b.attr('title').value = 'project b';
  b.attr('summary').value = 'project b desc';
  b.attr('requirements').value = 'project b req';
  */
  /*
  u1 = db.datum("alpha");
  u1.attr("is_a").value = 'user';
  u1 = db.datum("bravo");
  u1.attr("is_a").value = 'user';
  u1 = db.datum("charle");
  u1.attr("is_a").value = 'user';
  u1 = db.datum("R and D");
  u1.attr("is_a").value = 'user';
  u1 = db.datum("marketing");
  u1.attr("is_a").value = 'user';
  */
  session = db.datum("session");
  session.attr("currentUser").value = '';
  /*
  offer1 = db.datum(aspot.uuid());
  offer1.attr("offerer").value = "bravo";
  offer1.attr("amount").value = "10000";
  offer1.attr("type").value = "revenue";
  a.attr("offer").value = offer1.value;
  offer2 = db.datum(aspot.uuid());
  offer2.attr("offerer").value = "alpha";
  offer2.attr("amount").value = "1000";
  offer2.attr("type").value = "revenue";
  a.attr("offer").new().value = offer2.value;
  */
  

  //console.log(db.query('."offer"[."offerer" = "alpha"]'));
  //console.log(db.query('."offer"[."offerer" = "bravo"]'));
  //console.log(db.query('[."offerer" = "alpha"]."amount"'));
  //console.log(db.query('[.<"offer" = "'+a.value+'"][."type" = "revenue"]."amount"'));
  //console.log(db.query('[.<"offer" = "'+a.value+'"][."type" = "revenue"]'));
  //console.log(db.query('[.<"offer" = "'+b.value+'" AND ."type" = "revenue"]."amount"'));
  //console.log(db.query('[.<"offer" = "'+b.value+'"][."type" = "revenue"]'));
  //console.log(db.query('[SELF = "'+a.value+'"]."offer"[."offerer" = "bravo"]'));
  //console.log(db.query('[.<"offer" = "'+a.value+'"]'));
  //console.log(db.query('[.>"offer" = "'+a.value+'"]'));
  //console.log(db.query('[SELF = "'+a.value+'"]."offer"'));
  //console.log(db.query('[SELF = "'+b.value+'"]."offer"'));
};

