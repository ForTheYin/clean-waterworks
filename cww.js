// ==UserScript==
// @name         Clean WaterWorks
// @namespace    http://fortheyin.com/
// @version      0.0.2
// @description  Cleans up WaterlooWorks to be more UI friendly
// @author       Andy Yin
// @match        https://waterlooworks.uwaterloo.ca/myAccount/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function sidebarToNav() {
    // Gets all of the links, and names on the sidebar
    function pruneSidebar() {
      var links = [];
      var $elements = $('.span2').find('li:has(a)');
      $elements.each(function (i, $element) {
        var $li = $element;
        var $a = $li.children[0];

        links.push({
          href: $a.attributes.href.nodeValue,
          name: $a.text,
          active: ($li.attributes.class && $li.attributes.class.nodeValue === 'active') || false
        });
      });

      return links;
    }

    // Adds links to a navbar
    function addLinksToNav($nav, links) {
      var $navbarInner = $('#brandingNav').find('.navbar-inner');
      links.forEach(function (link) {
        var liAttribute = link.active ? ' class="active"' : '';
        var $li = $('<li' + liAttribute + '><a href="' + link.href + '">'+ link.name +'</a></li>');
        $nav.append($li);
      });

      $navbarInner.append($nav);
    }

    // Create custom top navbar
    var $nav = $('<ul class="nav navbar-nav"></ul>');
    var links = pruneSidebar();

    // Remove left sidebar
    $('.span2').remove();
    addLinksToNav($nav, links);

    // Force content to take full width
    $('.span10').css('width', '100%');
  }

  function normalizeJobPostings() {
    var $postingsTable = $('#postingsTable');
    if ($postingsTable.length === 0) {
      return;
    }

    // Remove no-wrap on the job postings, so we can fit more content
    $postingsTable.css('white-space', 'normal');
    $postingsTable.find('td').css('white-space', 'normal');
  }

  function bottomPagination() {
    // Remove old pagination clones
    $('.--cww-pagination').remove();

    // Fetch latest pagination
    var $paginationClone = $('.pagination').clone();
    if ($paginationClone.length === 0) {
      return;
    }

    // Add class tag for later deletion
    $paginationClone.addClass('--cww-pagination');
    $paginationClone.css('margin-top', '10px');
    $('#mainContentDiv > .row-fluid > .span12').append($paginationClone);
  }

  function clickAnywhereMailbox() {
    var $mailbox = $('#dashboard_userCommonMyMessagesTableID');
    if ($mailbox.length === 0) {
      return;
    }

    // Mail is asynchronously fetched, but not in consistent way, so if we're on
    // the mailbox page, we need to check until the mail appears, and self-terminate
    var interval = setInterval(function () {
      var $headers = $mailbox.find('thead > tr');
      var $messages = $mailbox.find('tbody > tr');

      if ($headers.length === 0) {
        return;
      }
      clearInterval(interval);

      // Removes the view button
      $headers[0].children[0].remove();

      // Update all rows to be clickable
      $messages.each(function (i, $message) {
        var clickFunction = $message.children[0].children[0].onclick;
        $message.onclick = clickFunction;
        $message.children[0].remove();
      });

    }, 50);
  }

  sidebarToNav();
  normalizeJobPostings();
  bottomPagination();
  clickAnywhereMailbox();

  // Override load job postings table to renormalize the table after sort
  var previousLoadPostingTable = window.loadPostingTable || function () {};
  window.loadPostingTable = function (orderBy, oldOrderBy, sortDirection, page, searchBy, keyword, callback) {
    previousLoadPostingTable(orderBy, oldOrderBy, sortDirection, page, searchBy, keyword, function () {
      if (callback) {
        callback();
      }
      normalizeJobPostings();
      bottomPagination();
    });
  };

})();
