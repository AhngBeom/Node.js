// public/javascripts/main.js

var timer = null;
var editing = false;

var load = function () {
	if (!editing) {
		$.get('/load', function (data) {
			$("#board-list").empty();
			$(data).each(function (i) {
				var id = this._id;

				$("#board-list").prepend(
					"<div class='card' id='" + id + "'>" +
					"<div class='card-header d-flex justify-content-between'>" +
					"<div class='d-flex align-items-center'>" +
					"<img class='rounded-circle w-25' src='" + this.picture + "'/>" +
					"<div class='writer-div h5 alert alert-success m-2 p-3' role='alert'>" + this.author + "</div>" +
					"</div>" +
					"<div class='d-flex'><button class='btn btn-link mr-3 border-like'><i class='fas fa-thumbs-up fa-5x text-primary'>" + this.like + "</i></button><button class='btn btn-link mr-3 border-hate' href='#'><i class='fas fa-thumbs-down fa-5x text-warning'>" + this.hate + "</i></button>" +
					"<div class='btn-group'><button class='btn btn-secondary dropdown-toggle' type='button' data-toggle='dropdown' data-display='static' aria-haspopup='true' aria-expanded='false'></button>" +
					"<div class='dropdown-menu dropdown-menu-right dropdown-menu-lg-right'><button class='dropdown-item board-modify' type='button'>MODIFY</button><button class='dropdown-item board-delete' type='button'>DELETE</button></div>" +
					"</div>" +
					"</div>" +
					"</div>" +
					"<div class='card-body'><div class='text-right text-muted'>" + this.date +
					"</div><h5 class='card-title'>" + this.contents + "</h5>" +
					"</div>" +
					"<div class='collapse_btn_" + id + " card-footer text-center text-muted btn' data-toggle='collapse' href='#collapse-comments'><i class='fas fa-angle-double-down mr-3'></i>View Comments Button</div>" +
					"<div class='collapse_ collapse-comments-" + id + "'>" +
					"<ul class='comment-list list-group list-group-flush'>" +
					"</ul>" +
					"<div class='input-group'>" +
					"<div class='input-group-prepend'><span class='input-group-text'>" + this.author + "</span></div><input class='form-control input-comment' type='text' placeholder='Comment' />" +
					"<div class='input-group-append'><button class='btn btn-outline-primary submit-comment' id='button-addon2' type='button'>Submit</button></div>" +
					"</div>" +
					"</div>" +
					"</div>"
				);

				id = this._id;

				$("#wall .item:first .input_comment").on("focus", function () {
					editing = true;
				});

				$("#wall .item:first .input_comment").on("blur", function () {
					editing = false;
				});

				$("#wall .item:first .input_comment").keypress(function (evt) {
					if ((evt.keyCode || evt.which) == 13) {
						if (this.value !== "") {
							comment(this.value, id);
							evt.preventDefault();
							$(this).val("");
							editing = false;
						}
					}
				});

				$(".collapse_btn_" + id).click(function (e) {
					comment_load(id);
					$(".collapse-comments-" + id).collapse('toggle');
				});

				var cnt = 0;

				$("#board-list .card .board-modify").click(function (evt) {
					// if ($("#board-input-form #username").val() == $(this).parents('.writer-div').val()) {

					editing = true;
					if (cnt === 0) {
						var contents = $("#board-list #" + id + " .card-title").html();
						console.log(contents);
						$("#board-list #" + id + " .card-body").html("<textarea id='textarea_" + id + "' class='textarea_modify form-control'>" + contents + "</textarea>");
						cnt = 1;
					}
					$("#textarea_" + id).keypress(function (evt) {
						if ((evt.keyCode || evt.which) == 13) {
							if (this.value !== "") {
								modify(this.value, id);
								evt.preventDefault();
								editing = false;
							}
						}
					});
					// } else {
					// 	alert("권한이 없습니다.");
					// }
				});

				$("#board-list .card .board-delete").click(function (evt) {
					// if ($("#message #displayName").val() == $(this).parents('.author').attr("id")) {
					del(id);
					// } else {
					// 	alert("권한이 없습니다.");
					// }
				});

				$("#board-list .card-header .border-like").click(function (evt) {
					editing = false;
					like(id);
				});

				$("#board-list .card-header .border-hate").click(function (evt) {
					editing = false;
					hate(id);
				});

			});
		});
	}
};
var comment_load = function (id) {

	$.get('/comment/load', { 'board_id': id }, function (data) {
		console.log(data);
		$(".collapse-comments-" + id + " .comment-list").empty();
		$(data).each(function (j) {
			$(".collapse-comments-" + this.post_id + " .comment-list").prepend(
				"<li class='list-group-item d-flex justify-content-between' id='" + this._id + "'>" +
				"<div class='d-flex' id='comment-div-"+ this._id +"'>" +
				"<div class='h4 mr-3 comment-content-" + this._id + "'>" + this.author + " : <span class='h3 alert alert-info p-1'>" + this.comment + "</span></div>" +
				"<button class='btn mr-3 comment-like'><i class='fas fa-thumbs-up text-primary'>" + this.like + "</i></button><button class='btn mr-3 comment-hate'><i class='fas fa-thumbs-down text-warning'>" + this.hate + "</i></button></div>" +
				"<div><button class='btn btn-link mr-3 comment-modify'>수정</button><button class='btn btn-link mr-3 comment-delete'>삭제</button></div>" +
				"</li>");
		});
		// var popoverTemplate = ['<div class="timePickerWrapper popover">',
		// 	'<div class="arrow"></div>',
		// 	'<div class="popover-content">',
		// 	'<div class="timePickerCanvas"></div>',
		// 	'<div class="timePickerClock timePickerHours"></div>',
		// 	'<div class="timePickerClock timePickerMinutes"></div>',
		// 	'</div>',
		// 	'</div>'].join('');

		// $('[data-toggle="popover"]').popover({
		// 	// selector: '[rel=popover]',
		// 	// trigger: 'click',
		// 	// template: popoverTemplate,
		// 	// placement: "bottom",
		// 	container: '#'+$(this).parents('.list-group-item').attr("id"),
		// 	html: true
		// });
		$('[data-toggle="popover"]').popover('show');

		$("#" + id + " .collapse-comments-" + id + " .submit-comment").click(function (evt) {
			var comment_value = $(this).parents('.input-group').children('.input-comment');
			comment(comment_value.val(), id);
			evt.preventDefault();
			comment_value.val('');
			editing = false;
		});

		$("#" + id + " .collapse-comments-" + id + " .input-comment").keypress(function (evt) {
			if ((evt.keyCode || evt.which) == 13) {
				if (this.value !== "") {
					var comment_value = $(this).parents('.input-group').children('.input-comment');
					comment(comment_value.val(), id);
					evt.preventDefault();
					comment_value.val('');
					editing = false;
				}
			}
		});

		var cnt = 0;

		$("#" + id + " .collapse-comments-" + id + " .comment-modify").click(function (evt) {
			var commentId = $(this).parents("li").attr("id");

			editing = true;
			if (cnt === 0) {
				var contents = $(".comment-content-" + commentId + " span").html();
				$(this).parents(".list-group-item").html("<div class='d-flex justify-content-between col-md-12'><textarea class='form-control col-md-9' id='comment-modify-" + commentId + "'>" + contents + "</textarea><button class='btn btn-secondary col-md-2'>수정완료</button></div>");
				cnt = 1;
			}
			$("#comment-modify-" + commentId).keypress(function (evt) {
				if ((evt.keyCode || evt.which) == 13) {
					if (this.value !== "") {
						comment_modify(this.value, commentId);
						evt.preventDefault();
						editing = false;
					}
				}
			});
		});

		$("#" + id + " .collapse-comments-" + id + " .comment-delete").click(function (e) {
			var commentId = $(this).parents("li").attr("id");
			comment_del(commentId);
		});

		$("#" + id + " .collapse-comments-" + id + " .comment-like").click(function (evt) {
			var commentId = $(this).parents("li").attr("id");
			console.log(commentId);
			editing = false;
			comment_like(commentId);
		});

		$("#" + id + " .collapse-comments-" + id + " .comment-hate").click(function (evt) {
			var commentId = $(this).parents("li").attr("id");
			console.log(commentId);
			editing = false;
			comment_hate(commentId);
		});
	});
};
var write = function (contents) {
	var postdata = {
		'author': $("#username").val(),
		'contents': contents,
		'picture': $("#board-input-form").find("#profile-img").attr('src')
	};

	$.post('/write', postdata, function () {
		load();
	});
};

var modify = function (contents, id) {
	var postdata = {
		'author': $("#" + id + " .writer-div").val(),
		'contents': contents,
		'_id': id,
	};
	$.post('/modify', postdata, function (msg) {
		load();
		if(msg.status === "REQUIRE ACCOUNT"){
			alert("수정 권한이 없습니다.\n로그인 해주세요.");
		}
	});
};

var comment_modify = function (contents, id) {
	var postdata = {
		'contents': contents,
		'_id': id,
	};
	$.post('/comment/modify', postdata, function (msg) {
		comment_load($("#" + id).parents(".card").attr("id"));
		if(msg.status === "REQUIRE ACCOUNT"){
			alert("수정 권한이 없습니다.\n로그인 해주세요.");
		}
	});
};

var comment = function (comment, id) {
	var postdata = {
		'author': $("#username").val(),
		'comment': comment,
		'borad_id': id
	};

	$.post('/comment', postdata, function () {
		comment_load(id);
	});
};

var del = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/del', postdata, function (msg) {
		load();
		if(msg.status === "REQUIRE ACCOUNT"){
			alert("삭제 권한이 없습니다.\n로그인 해주세요.");
		}
	});
};

var comment_del = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/comment/del', postdata, function (msg) {
		comment_load($("#" + id).parents(".card").attr("id"));
		if(msg.status === "REQUIRE ACCOUNT"){
			alert("삭제 권한이 없습니다.\n로그인 해주세요.");
		}
	});
};

var like = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/like', postdata, function () {
		load();
	});
};

var hate = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/hate', postdata, function () {
		load();
	});
};

var comment_like = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/comment/like', postdata, function () {
		comment_load($("#" + id).parents(".card").attr("id"));
	});
};

var comment_hate = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/comment/hate', postdata, function () {
		comment_load($("#" + id).parents(".card").attr("id"));
	});
};

$(document).ready(function () {

	$(".comment-like").click(function (evt) {
		var commentId = $(this).parents("li").attr("id");
		console.log("#" + id + " .collapse-comments-" + id + " .comment-like");
		// editing = false;
		// comment_like(commentId);
	});

	$("#message textarea").on("focus", function () {
		editing = true;
	});

	$("#message textarea").on("blur", function () {
		editing = false;
	});

	$("#message textarea").keypress(function (evt) {
		if ((evt.keyCode || evt.which) == 13) {
			console.log(this.value)
			if (this.value !== "") {
				console.log("write");
				write(this.value);
				evt.preventDefault();
				$("#message #passwordInput").val("");
				$(this).val("");
				editing = false;
			} else {
				alert("내용을 입력해주세요.");
			}
		}
	});

	$("#board-submit").click(function (evt) {
		if ($("#board-input-form textarea").val() == "") {
			alert("내용을 입력해주세요.");
		} else {
			write($("#board-input-form textarea").val());
			$("#board-input-form textarea").val("");
			editing = false;
		}
	});

	load();
	timer = setInterval(load(), 5000);
});		  