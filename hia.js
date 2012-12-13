
theme = {}
theme.element = function(tag, classes, content) {
  var tag = $("<"+tag+"></"+tag+">");
  if(typeof classes != 'undefined') {
    $.each(classes, function() {
      item = this.toString();
      if(item.match(/^#/)) {
        tag.attr("id", item.replace(/^#/,''))
      }
      else {
        tag.addClass(this.toString());
      }
    });
  }
  if(typeof content != 'undefined') {
    tag.html(content);
  }
  return tag;
}
theme.addStyle = function(style) {
  if(!$("#abid-style").length) {
    $('body').append("<style id = 'abid-style'>");
  }
  $("#abid-style").text($("#abid-style").text() + style + "\n");
}

theme.isAList = function (db, is_a) {
  var items = db.query('[."is_a" = "'+is_a+'"]');
  var tag = theme.element("div", []);
  items.forEach(function(item) {
    tag.append(theme.edit.contenteditable(item));
  });
  return tag;


}
theme.report = function (db,query, headers, fieldCallbacks) {
  var data = db.query(query);
  var table = theme.element("table", ["list"]);
  var thead = theme.element("thead", []);
  var header = theme.element("tr");
  headers.forEach(function(head) {
    header.append(theme.element("th", [], head));
  });
  thead.append(header);
  table.append(thead);
  data.forEach(function(datum) {
    var row = theme.element("tr", []);
    fieldCallbacks.forEach(function(cb) {
      var cell = theme.element('td');
      inner = cb(datum);
      if(typeof inner == 'string') {
        cell.html(inner);
      }
      else {
        cell.append(cb(datum));
      }
      row.append(cell);
    })
    table.append(row);
  });
  return table;
}
theme.display = {}
theme.display.simple = function(datum, label) {
  var tag = theme.element("div", ['abid-simple'], label + datum.value);
  return tag;
}
theme.edit = {};
theme.edit.contenteditable = function(datum, label) {
  var uuid = "#uuid-" + aspot.uuid();
  var tag = theme.element("div", [uuid,'contenteditable'], datum.value);
  tag.attr('contenteditable', 'TRUE');
  tag.data("datum", datum);
  if(typeof label != 'undefined') {
    theme.addStyle(uuid+':before { content:"'+label+'"}');
  }
  tag.blur(function() {
    var html = $(this).html();
    html = html.replace(/\[(.*?):(.*?)\]/, '<a href="$2">$1</a>');
    html = html.replace(/<br>$/, '');
    $(this).data("datum").value =  html;
    
    $(this).html(html);
  })
  return tag;
}

theme.dropdown = function(datum, label, options) {
  var uuid = "#uuid-" + aspot.uuid();
  var tag = theme.element("div", [uuid,'contenteditable'], datum.value);
  tag.data('options', options);
  tag.data('datum', datum);
  tag.attr('contenteditable', 'TRUE');
  theme.addStyle(uuid+':before { content:"'+label+'"}');
  tag.focus(theme.dropdown.focus);
  return tag;
}
theme.dropdown.query = function(datum, label, options_query) {
  var options = datum.datum.db.query(options_query).map(function(item) { return item.value;});
  return theme.dropdown(datum, label, options);
}
theme.dropdown.focus = function(e) {
  var tag = theme.element("select", ['dropdown']);
  tag.attr('id', $(this).attr('id'));
  var value = $(this).html();
  var options = $(this).data('options');
  tag.data('options', options);
  tag.data('datum', $(this).data('datum'));
  $.each(options, function() {
    var opt = theme.element("option", [], this.toString());
    if(this.toString() == value) {
      opt.attr("selected", "selected");
    }
    tag.append(opt)
  });
  tag.blur(theme.dropdown.blur);
  $(this).replaceWith(tag);
}
theme.dropdown.blur = function(e) {
  var value = $(this).val();
  datum = $(this).data('datum');
  datum.value = value;
  var options = $(this).data('options');
  var tag = theme.element("div", ['contenteditable'], datum.value);
  tag.data('options', options);
  tag.data('datum', datum);
  tag.html(value);
  tag.attr('id', $(this).attr('id'));
  tag.attr('contenteditable', 'TRUE');
  tag.focus(theme.dropdown.focus);
  $(this).replaceWith(tag);
}
