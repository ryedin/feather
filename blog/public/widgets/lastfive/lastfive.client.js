jojo.ns("blog");
(function() {
	
	blog.lastfive = jojo.widget.create({
		name : "blog.lastfive",
		path : "widgets/lastfive/",
		prototype : {
			initialize : function($super, options) {
				$super(options);
				var me = this;

        me.server_getPosts(function(result) {
          me.getPostsCallback(result);
        });
			},
			showLoadError: function(err) {
			  this.get("#lastFiveList").empty().append('<li class="blogentry"><h3 id="' + me.id + '_blog_header_' + curr.id + '">An error occurred while loading blog posts</h3><p class="collapsed">'+ err +'</p></li>');
			},
			getPostsCallback: function(result) {
        if (result.success) {
          blog.entries = result.result;
          this.loadPosts();
        } else {
          
        }
			},
			loadPosts: function() {
        var me = this;
			  var maxEntries = blog.entries.length;
				var ul = me.get('#lastFiveList');
				var curr;
				if (maxEntries > 5) { maxEntries = 5; }
				ul.empty();
				for (var i = 0; i < maxEntries; i++) {
					
					curr = blog.entries[i];
					ul.append('<li class="blogentry"><h3 id="' + me.id + '_blog_header_' + curr.id + '"><a href="/post?id=' + curr.id + '">' + curr.summary + '</a> <span style="font-style:italic;font-size:75%;">Posted on ' + new Date(curr.pubDate.toString()).toString("MM/dd/yyyy hh:mm tt") + '</span></h3><p id="blog_content_' + curr.id + '" class="collapsed">' + curr.post + '</p></li>');
					
				}
				
				// Bind a click event to the headers to expand / collapse them.
				this.domEvents.bind(this.get("#lastFiveList .blogentry h3"), "click", function(event) {
					var target = event.target || event.srcElement;
					if (target) {
						var content = $(target).next('p');
						if (content.hasClass('collapsed')) {
							content.removeClass('collapsed');
						} else {
							content.addClass('collapsed');
						}
					}
				});
			},
			refreshPosts: function() {
			  var me = this;
			  me.server_getPosts(function(result) {
			    me.getPostsCallback(result);
			  });
			}
		}
	});

})();
