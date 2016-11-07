	var map;
	function generateUUID() {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	};
	function getVar(name){
	   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	      return decodeURIComponent(name[1]);
	}
	function initMap() {
		var myLatLng = {lat: 50.438, lng: 30.615};

		var map = new google.maps.Map(document.getElementById('map'), {
		    zoom: 17,
		    center: myLatLng
		});

		var marker = new google.maps.Marker({
		    position: myLatLng,
		    map: map,
		    title: 'ООО "КЛТ КРЕДИТ"'
		});
	}

$(function(){


	var tId = getVar('transaction_id');
	var salesId = getVar('aff_sub');

	if( salesId ){
		$.cookie('track_sd', salesId, {expires: 31, path: '/'});
		$.removeCookie('track_t');
	}
	if( tId ) {
		$.cookie('track_t', tId, {expires: 31, path: '/'});
		$.removeCookie('track_sd');
	}

	// regform validator
	(function(){

		if(!$.fn.inputmask) return;
		var f=$('#formReg');

///////////

		var html = '';
		for(var i=1;i<=31;i++){
			html += '<option value='+i+'>'+i+'</option>';
		}
		f.find('[name="bdate_d"]').append( html );

		html = '';
		for(var i=1;i<=12;i++){
			html += '<option value='+i+'>'+i+'</option>';
		}
		f.find('[name="bdate_m"]').append( html );

		var html = '';
		for(var i=1935;i<=2016;i++){
			html += '<option value='+i+'>'+i+'</option>';
		}
		f.find('[name="bdate_y"]').append( html );


///////////
		$(document).on('mouseover', '.helper', function(){
			var text = $(this).parent().find('.helper_text');
			var w=$(text).width();
			text.css({marginLeft: (-w/2+20)+'px'});
			text.fadeIn(200);
		});
		$(document).on('mouseout', '.helper', function(){
			var text = $(this).parent().find('.helper_text');
			text.fadeOut(200);
		});
		var lang = $('#js-lang').val();

		var languages = {
			'ru':{
				'required': 'Нужно заполнить поле',
				'tel_exists': 'Телефон %phone% уже зарегистрирован',
				'wrong_code': 'Код указан не верно'
			},
			'ua':{
				'required': 'Необхідно заповнити поле',
				'tel_exists': 'Телефон %phone% все зареестрований',
				'wrong_code': 'Код вказано не вірно'
			}
		}

		$('#formVerify').submit( function(){
			$(this).ajaxSubmit({
				dataType: 'json',
				success: function(reply){
					if( reply.status == 'error'){
						return renderError( languages[lang].wrong_code, $('#formVerify'));
					}
					top.location='/online/account/profile?wizard#wizard';


				}
			});
			return false;
		});

		function renderError( msg,f ){
			f.find('[type="submit"]').before('<div class=error>'+msg+'</div>');
			f.find('[type="submit"]').parent().find('.error').css({
				textAlign:'center',
				width: '100%',
				clear: 'both',
				marginBottom:'20px',
			});



		}
		f.submit( function(){
			$(this).ajaxSubmit({
				dataType: 'json',
				success: function(reply){
					if(reply.status=='error'){
						// something happened
						return renderError( reply.error,f );
					}
					f.slideUp( function(){
						$('#formVerify').slideDown();
					});
				}
			});
			return false;
		});

		f.submit( function(){
			dataLayer.push({'event': 'registration_sendform'});
		});

		f.find('.form-control').each( function(i,el){

			var help = $(el).data('help');
			if( help ){
				$(el).after('<div class=helper_parent><div class=helper>?</div><div class=helper_text>'+help+'</div></div>');

			}
			var textLeft = $(el).attr('placeholder');
			if( $(el).data('left')) textLeft = $(el).data('left');

			if(!textLeft) return;
			var label_text = textLeft;

			$(el).before('<label class=field_text>'+label_text+'</label>');

		});
		f.find('[type="text"]').focus( function(){
			$(this).parent().find('.error').remove();
			$(this).css('background','#f7f7f7');



		});

		f.find('[type="text"]').blur( function(){
			var v=this.value;

			if(v.length === 0) {
//				debugger;
				if( $(this).parent().find('.error').length>0) return;
				$(this).css('background','#ffeeee');
				$(this).after('<div class=error>'+languages[lang].required+'</div>');
				return ;
			}
			this.value = v[0].toUpperCase()+v.substring(1);
			return true;
		});
		f.find('[name="inn"]').blur( function(){
			if( this.value.length!=10){
				this.value = ''; $(this).trigger('blur'); return;
			}
		});
		f.find('[name="bdate"]').blur( function(){
			var v= this.value;
			if(v.length==0) return;
			if( !v.match(/^\d{2}\.\d{2}\.\d{4}/)) {
				$(this).val(''); $(this).trigger('blur'); return false;

				return false;
			}
			var e=v.split('.');
			var error = false;
			if( +e[0]<1 || +e[0]>31) error=1;
			if( +e[1]<1 || +e[1]>12) error=1;
			if( +e[2]<1935 || +e[2]>2016) error=1;
			if(error) {
				$(this).val(''); $(this).trigger('blur'); return false;
			}

		});
		f.find('[name="phone"]').blur( function(){
			var v=this.value;
			var e= v.split(' ');
			if(e.length!=3) return;
			var code = parseInt(e[1].substring(1));
			var codes = [39, 50, 63, 66, 67, 68, 91, 92, 93, 94, 95, 96, 97, 98, 99, 73];
			var founded = 0;
			for(var i in codes){
				if( codes[i]==code) founded=1;
			}
			if(!founded) {
				$(this).val('').trigger('blur'); return false;
			}
			// check phone
			var el=this;
			$.get('/online/?check_phone='+v, function(r){
				if(!r.status) return;
				$(el).val('').focus();
				$(el).after('<div class=error>'+languages[lang].tel_exists.replace('%phone%', v)+'</div>');

			}, 'json');

		});


		f.find('[name="inn"]').inputmask('9999999999');
		f.find('[name="phone"]').inputmask('+380 (99) 999-9999');

		f.find('[name="bdate"]').inputmask('99.99.9999');
		f.find('[name="lastName"],[name="firstName"],[name="thirdName"]').inputmask({mask: 'rrrrrrrrrrrrrrrr', greedy: true, placeholder:''});


	})()



	//eo reg form

	// auth check
	// $.get('/online/?is_auth', function(r){
	// 	if(r){
	// 		$('.login:eq(0)').fadeOut( function(){
	// 			$('.login:eq(1)').text(r).fadeIn();
	// 			$('#about .btnCredit').click( function(){
	// 				top.location='/online/account'
	// 				return false;
	// 			});
	//
	// 		});
	// 	}
	// }, 'json');



  setTimeout(
	  function()
	  {
	    $('body').animate({

	      opacity:1
	    });
	  }, 00);

  if($.cookie && $.cookie("css")) {
    $('link[href="/css/custom.css"]').attr("href",$.cookie('css'));
  }


  $('.to_mobile').click(function() {
      $('link[href="/css/custom_desc.css"]').attr('href', '/css/custom_mob.css');
      $('link[href="/css/custom.css"]').attr("href",'/css/custom_mob.css');
      $.cookie("css",'/css/custom_mob.css', {expires: 365, path: '/'});
      return false;
  });

  $('.to_desktop').click(function() {
      $('link[href="/css/custom_mob.css"]').attr("href",'/css/custom_desc.css');
      $.cookie("css",'/css/custom_desc.css', {expires: 365, path: '/'});
      return false;
  });


  $('.ua').text('Українська');


  $('.first_tel').append("<a href='tel:+38 (044) 365 73 73'><i>+38 (044)</i>365&middot;73&middot;73</a><br /><a href='tel:+38 (066) 144 73 73'><i>+38 (066)</i>144&middot;73&middot;73</a><br />");
  $('.second_tel').append("<a href='tel:+38 (096) 365 73 73'><i>+38 (096)</i>144&middot;73&middot;73</a><br /><a href='tel:+38 (063) 144 73 73'><i>+38 (063)</i>144&middot;73&middot;73</a><br />");


  $('#accordion h4').prepend('<i></i>');
  /* CSS Animation */

    $('.preim_jpg.animated').hover(
      function(){
        $(this).addClass('rubberBand');
      }, function() {
        $(this).removeClass('rubberBand');
    });

  /* CSS Animation */

var avg_day_application = 150;
var avg_day_credits = 53;

var start_app = 7000;
var start_credits = 2450;

var avg_min_application = ( avg_day_application / (60*24));
var avg_min_credits = ( avg_day_credits / (60*24));

var start_day = 1474064787;
var diff = Math.round( (Math.round( (new Date()).getTime()/1000 ) - start_day) /60);

var add_application = diff * avg_min_application;
var add_credits = diff * avg_min_credits;


function count(){
    var counter = { var: 0 };
    TweenMax.to(counter, 2, {
      var: Math.round( start_app + add_application) ,
      onUpdate: function () {
          $('#counter').html(Math.ceil(counter.var));
      },
      onComplete: function(){
         //count();
     },
      ease:SlowMo.ease
  });
}

function count1(){
    var counter = { var: 0 };
    TweenMax.to(counter, 2, {
      var: Math.round( start_credits + add_credits) ,
      onUpdate: function () {
          $('#counter1').html(Math.ceil(counter.var));
      },
      onComplete: function(){
         //count();
     },
      ease:SlowMo.ease
  });
}

count();
count1();




  function ceil(v) {
      return Math.ceil(parseFloat(v));
   }

  var url_ua = document.location.href;
  var str_ua = '/ua/';
  var result = url_ua.match(str_ua);

  if (result) {
      $('#slider-range-money .ui-slider-handle').append('<input type/text id="money" min=2500 max=10000 step=50 value="" /><span id=overflow style="position:relative;top:-40px; left: 60px;">Можна отримати</span><span class="overflow_corner"></span>');
  } else {
      $('#slider-range-money .ui-slider-handle').append('<input type/text id="money" min=2500 max=10000 step=50 value="" /><span id=overflow style="position:relative;top:-40px; left: 60px;">Можно получить</span><span class="overflow_corner"></span>');
  }

  $('#slider-range-day .ui-slider-handle').append('<input type/text id="days" step=1 value="" /><span id="overdays" style="display:none;"></span><span style="display:none;" class="overflow_corner_days"></span>');

  $('#money').wrap('<span id="wr_inp"></span>');
  $('#days').wrap('<span id="wr_inp2"></span>');
	$('#overflow').css({
		border:'2px solid rgb(208, 208, 208)',
		padding: '6px',
		fontSize: '62%',
		background: '#e5ebec',
		top: '72px',
		left: '-52px',
		width: '140px',
		borderRadius: '5px',
		textAlign: 'center',
		position:'absolute'
	});
	var _a = Math.min($('#slider-range-money').data('max')||2500, $.cookie('_a')||2500);
	_a = isNaN(_a)?2500:_a;
    $("#slider-range-money").slider({
        range: "min",
        value: _a,
        min: 500,
        max: $('#slider-range-money').data('max')||10000,
        step: 50,
        slide: function (event, ui) {
            $('#money').css({
              'color':'black'
            });
            $("#money").val(ceil(ui.value));
      			var v = ceil(ui.value);
      			var creditNumber = false;
      			var limits = [2500, 3500, 4000, 5000, 6000, 7000, 8000, 10000];
      			var iter = 1;

      			for(var i in limits){
      				if (v <= limits[i] && creditNumber === false){
      					creditNumber = iter;
      				}
      				iter++;
      			}
//      			console.log(creditNumber);
      			var showOverflow = creditNumber > 1;
      			/*if( v > 3500 ){
      				$('#overflow').css('left','-200px');
      			}
      			else{
      				$('#overflow').css('left','70px');
      			}*/
      			if(showOverflow) {
              if (result) {
                $('#overflow').html('Доступно<br />при ' + creditNumber + '-м кредиті').fadeIn();
              } else {
      				  $('#overflow').html('Доступно<br />при ' + creditNumber + '-м кредите').fadeIn();
              }
      			} else {
              if (result) {
                $('#overflow').html('Можна отримати');
              } else {
      				  $('#overflow').html('Можно получить');
              }
      			}
            update();
        }
    });
    $("#money").val(ceil($("#slider-range-money").slider("value")));

    var keyUpData = true;

	var _d = Math.min($('#slider-range-day').data('max')||10, $.cookie('_d')||10);
	_d = isNaN(_d)?10:_d;

    $("#slider-range-day").slider({
        range: "min",
        value: _d,
        min: 7,
        max: $('#slider-range-day').data('max')||65,
        step: 1,
        slide: function (event, ui) {
            $('#days').css({
              'color':'black'
            });
            /*console.log(' = ' + ui.value);
            console.log(' = ' + (ui.value != 'NaN'));*/
            if (ui.value != 'NaN' && ui.value > 0) {
              $("#days").val(ui.value);
            }
            var days = $('#days').val();
            if (days >= 31 && days <= 65) {
              if (result) {
                $('#overdays').html('Доступно<br />постійним клієнтам').fadeIn();
              } else {
                $('#overdays').html('Доступно<br />постоянным клиентам').fadeIn();
              }
              $('.overflow_corner_days').fadeIn();
            } else {
                $('#overdays').css({
                  display: 'none'
                });
                $('.overflow_corner_days').css({
                  display: 'none'
                });
            }
            update();
        }
    });

    $("#days").val($("#slider-range-day").slider("value"));

    function update(money, day) {
        var money, day;
        money = $('#money').val();
        day = $('#days').val();
        var count = (money * day) * 0.0162;
        var itog = Number(money) + Number(count);
        $('.c_count-perc span').text(ceil(count.toFixed(2)));
        $('.c_count-itog:eq(0) span').text(ceil(itog.toFixed(2)));
        $('.c_count-itog:eq(1) span').text(dateAdd(parseInt(day)));
        // console.log(day);

        $('.js-back-date h3').text(dateAdd(parseInt(day)));
        $('.js-back h3').text(ceil(+money+count)+' грн');
        $('.js-amount h3').text(ceil(money)+' грн');
	$('[name="amount"]').val( +money );
	$('[name="days"]').val( day);

      $.cookie("_a",+money, {expires: 365, path: '/'});
      $.cookie("_d",+day, {expires: 365, path: '/'});






        // $('#money').val(money);
        // $('#days').val(day);

    }

	day = $('#days').val();

    function dateAdd(days) {
        var d = new Date;
        d.setDate(d.getDate() + days + 0);//1);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
//        console.log(d);
        var day = d.getDate();
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;
        return day + '.' + month + '.' + year;
    }

    update();

    $('input').on('click', function() {
      $(this).select();
    });

    $('input').change(function() {
      var changeMoney = $('#money').val();
      var changeDay = $('#days').val();
      if ((changeMoney < 500) || (changeMoney > 10000)) {
        $('#money').css({
          'color':'#E48900'
        });
        return false;
      } else if ((changeDay < 7) || (changeDay > 65)) {
        $('#days').css({
          'color':'#E48900'
        });
        return false;
      } else {
        $('#money').css({
          'color':'black'
        });
        $('#days').css({
          'color':'black'
        });
        switch (this.id) {
          case "money":
//          console.log('112');
          $("#slider-range-money").slider("value", $(this).val());
          update();
          break;
          case "days":
//          console.log('111');
          $("#slider-range-day").slider("value", $(this).val());
          update();
          break;
        }
      }
    });


    var _d = new Date;
    var _dd = _d.getFullYear()+'-'+_d.getMonth()+'-'+_d.getDate();
    var date = new Date();
    date.setMonth(date.getMonth() + 1);

    $('#days').datepicker({

        dayNamesMin:[ 'Вс',"Пн","Вт","Ср","Чт","Пт","Сб"],
        monthNames:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        format: 'Y-m-d',
        defaultDate: + 11,
        start_date: _dd,
        maxDate: + 31,
        minDate: + 8,
        onSelect: function(v,e){
          $('#days').css({
            'color':'black'
          });
//          console.log(v);
//          console.log(e.minDate);
		var _v = $(this).val();
		if( _v.match(/\d{2}\.\d{2}\.\d{4}/)){
			var ve=_v.split('.');
			_v = ve[2]+'-'+ve[1]+'-'+ve[0];
			v=_v;
		}
          var diff = new Date(v);
//          console.log(diff);
          diff-=(new Date()) ;

          diff/=( 1000*60*60*24);
          diff = Math.ceil(diff)-1;

          // $('#days').val(diff);
          $('#slider-range-day').slider('value', diff);
          var hs = $('#slider-range-day').slider();
          hs.slider('option','slide').call(hs, null, { handle: $('#slider-range-day', hs), value: diff});
          // update
        }

      });

/*
    $('#wr_inp2').Zebra_DatePicker({
      direction: [7,24],
      days_abbr: ['Вс',"Пн","Вт","Ср","Чт","Пт","Сб"],
      format: 'Y-m-d',
      start_date: _dd,
      months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
      onSelect: function(v,e){
        var diff = new Date($(this).val());
//        console.log(diff);
        diff-=(new Date()) ;

        diff/=( 1000*60*60*24 );
        diff = Math.ceil(diff)-1;

        $('#days').val( diff );
        $('#slider-range-day').slider('value',diff);
        var hs = $('#slider-range-day').slider();
        hs.slider('option','slide').call(hs, null, { handle: $('#slider-range-day', hs), value: diff});


      }
    });
*/



    $('#dayD').change( function(){
//      console.log( $(this).val());
    });

    /*
    $('#money').keydown( function(){_do=5;});
    $('#money').blur( function(){
      if( $(this).val()=='') $(this).val('1500');
      var v=parseInt($(this).val());
      if( v< 1500) v=1500;
      if( v>8000) v=8000;
      $(this).val(v);
//      console.log('do');
    });

    var _do=false;
    setInterval( function(){
    if( _do<0) return;
    if(_do==0){
    $('#money').trigger('blur'); _do=false;
            var hs = $('#slider-range-money').slider();
            var diff = parseInt($('#money').val());
            var obj = '#slider-range-money';
            $(obj).slider('value',diff);
            hs.slider('option','slide').call(hs, null, { handle: $(obj, hs), value: diff});
    }
    _do--;
    },100);

    */


  $('.pp').click( function() {
        if ((parseInt($('#money').val()) == '500' && $(this).hasClass('minus'))
          || (parseInt($('#money').val()) == '10000' && $(this).hasClass('plus'))) {
          return false;
        } else {
          var value = parseInt( $('#'+$(this).data('target')).slider('value') );
          var hs = $('#'+$(this).data('target')).slider();
          var diff = value+parseInt($(this).data('value'));
          var obj = '#'+$(this).data('target');
          $(obj).slider('value',diff);
          hs.slider('option','slide').call(hs, null, { handle: $(obj, hs), value: diff});
          $('#money').css({
            'color':'black'
          });
          $('#days').css({
            'color':'black'
          });
          return false;
        }
    });

    $('.pp_date').click( function() {
        if ((parseInt($('#days').val()) == '7' && $(this).hasClass('minus'))
          || (parseInt($('#days').val()) == '30' && $(this).hasClass('plus'))) {
          return false;
        } else {
          var value = parseInt( $('#'+$(this).data('target')).slider('value') );
          var hs = $('#'+$(this).data('target')).slider();
          var diff = value+parseInt($(this).data('value'));
          var obj = '#'+$(this).data('target');
          $(obj).slider('value',diff);
          hs.slider('option','slide').call(hs, null, { handle: $(obj, hs), value: diff});
          $('#money').css({
            'color':'black'
          });
          $('#days').css({
            'color':'black'
          });
          return false;
        }
    });

    $('#to_top').click(function() {

     // event.preventDefault()
        $(window.opera ? 'html' : 'html, body').animate({
            scrollTop: 0
        }, 'slow');

        return false;
    });

    /*******Nice Scroll******/
    //$("html").niceScroll();  // The document page (body)
  //$(".scroller").getNiceScroll().resize()

     if( $(document).innerWidth() < 400){
		$('.flex-caption').hide();
	}
     $('.flexslider').flexslider({
            animation: "fade",
            controlNav: false,
            manualControls: ".slide_controll li",
            directionNav: false,
            pausePlay: false,
            start: function(slider){
              $('body').removeClass('loading');

               //var tls = $('.flex-caption');

              var tls = new TimelineLite();
              var sss = $('.flex-caption');
              tls.fromTo(sss, 0.6, {left:-1288}, {left:'0',  ease:Expo.easeOut}, '+=0.3')
              //alert('ssss');
            },
            before: function(slider){
              var sss = $('.flex-caption');
              sss.css('left', '-1288px');

            },
            after: function(slider){
               // $(slider).find(".flex-active-slide").find('.caption-inner').addClass("animated fadeInUp");
              // alert('ssss');


              var tls = new TimelineLite();
              var sss = $('.flex-caption');
              //sss.css('left', '-1288px');
              tls.fromTo(sss, 0.6, {left:-1288}, {left:'0',  ease:Expo.easeOut}, '+=0.1')
              //var tls = new TimelineLite();
              //var sss = $('.flex-caption');
              //tls.fromTo(sss, 0.9, {left:-1288}, {left:'0',  ease:Power2.easeOut}, '+=0.7')
            }
      });


    /***Hover Effect with mask**/
    $('span.mask').hover(
        function () {
          $(this).siblings('a img').addClass('hovering');
          $(this).parent().siblings(".portfolio-title").children("h4").stop().animate({
              top: -20
            }, 350);
        },
        function () {
          $(this).siblings('a img').removeClass('hovering');
          $(this).parent().siblings(".portfolio-title").children("h4").stop().animate({
              top: 0
            }, 350);
        }
  );


        $('a[href*="#"]:not([href="#"])').click(function() {
          if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
            || location.hostname == this.hostname) {

            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top
              }, 500);
              return false;
            }
          }
        });


  $('.get_cre, .cre_its a:eq(0)').click(function(){

    var windowWidth = $(window).width();

    if (windowWidth <= 650) {

      $('html, body').delay(200).animate({
        scrollTop: ($("#calc").offset().top + 130)
      }, 500);

    } else {

      $('html, body').delay(200).animate({
        scrollTop: ($("#calc").offset().top - 73)
      }, 500);

    }


    $('.credit_box li').css('visibility','hidden');
    $('.credit_box #ans1').css('visibility','hidden');
     setTimeout(function() {
      var tl = new TimelineLite();
      var ss = $('.credit_box');
     // tl.to(bd1, 1, {opacity:0, autoAlpha:0, delay:1.5})
     // tl.to(bd, 0.2, {autoAlpha:0.7})
      //tl.fromTo(ss, 1, {top:-288, height:0}, {top:'50%', height:288, ease:Power2.easeOut}, '-=0.3')
      tl.staggerFrom(ss.find('li'), 1.6, {autoAlpha:0, scale:1.5, ease:Elastic.easeOut}, 0.2)
      tl.to(ss.find('#ans1'), 1.6, {autoAlpha:1}, 1);
     },1000);

     return false;
  });


$('.pay_cre, .cre_its a:eq(1)').click(function(){

   // event.preventDefault()

   var windowWidth = $(window).width();

   if (windowWidth <= 650) {
     $('html, body').delay(200).animate({
        scrollTop: ($("#pay_cre").offset().top + 130)
      }, 500);
    } else {
      $('html, body').delay(200).animate({
        scrollTop: ($("#pay_cre").offset().top - 73)
      }, 500);
    }

   $('.pay_box li').css('visibility','hidden');
    $('.pay_box #ans2').css('visibility','hidden');

   setTimeout(function() {
      var tl = new TimelineLite();
      var ss = $('.pay_box');
     // tl.to(bd1, 1, {opacity:0, autoAlpha:0, delay:1.5})
     // tl.to(bd, 0.2, {autoAlpha:0.7})
      //tl.fromTo(ss, 1, {top:-288, height:0}, {top:'50%', height:288, ease:Power2.easeOut}, '-=0.3')
      tl.to(ss.find('#ans2'), 0.6, {autoAlpha:1}, 0.1);
      tl.staggerFrom(ss.find('li'), 1.6, {autoAlpha:0, scale:1.5, ease:Elastic.easeOut}, 0.1)

     },1000);

   return false;

  });


/*  $('.pay_cre').click(function(){



     $('html, body').delay(200).animate({
      scrollTop: ($("#pay_cre").offset().top - 74)
    }, 500);
  });*/


      /*$('.partners a').attr('id', function (i) {
        return 'par_' + (i + 1);
      });*/

       $('#anim_cre ul li').attr('id', function (i) {
        return 'part_' + (i + 1);
      });


    /*****google map*****/

});



$(document).load($(window).bind("resize", checkPosition));

function checkPosition()
{
    if($(window).width() < 768)
    {
      //alert('sssss')
       // $("#body-container .main-content").remove().insertBefore($("#body-container .left-sidebar"));
    } else {
        //$("#body-container .main-content").remove().insertAfter($("#body-container .left-sidebar"));
    }
}

$(function(){
//	$('.bottom_contacts').css({bottom:-50});

})
$(window).scroll(function(){



    // alert(2);


    if($(document).scrollTop() > 100){


                $('#ha-header').addClass('test');

                $('#ha-header').stop().animate({
                    opacity:0.9
                },100);

                $('.cre_its ul li:first-child a').css({
                    'background':'#82AC40',
                    'color':'white'
                },100);




        } else if($(document).scrollTop() < 100) {


               $('#ha-header').stop().animate({
                    opacity:1
                },100);

               $('.cre_its ul li:first-child a').css({
                    'background':'none',
                    'color':'#15639d'
                },100);



        }

      if($(document).scrollTop() > 600){
          $('#to_top').stop().animate({
                    opacity:1
                },100);
      }

      else if($(document).scrollTop() < 600) {

          //$('#logo').hide();


               $('#to_top').stop().animate({
                    opacity:0
                },100);

        }

		var bottomContacts = $('.bottom_contacts');
		var scrolling = $(document).scrollTop();
		var tl = new TimelineLite();
		console.log(scrolling);


		if (scrolling>5200) {
		  tl.to(bottomContacts, 0.4, {opacity: 0.2, bottom: -50});
		} else{
		  tl.to(bottomContacts, 0.4, {opacity: 1, bottom: 0});
		}

});

/***** random photo in landings *****/

function randomPhoto(min, max) {
    var rand = min + Math.random() * (max - min);
    rand = Math.round(rand);
    $('.land_img').append('<img src="/imgg/landing/' + rand + '.png" alt="" />');
}
randomPhoto(1, 12);

/***** /random photo in landings *****/


$(document).ready(function() {

    $('footer .boxi img.animated, .mob_version_button.animated, .inv_friend_button.animated').hover(function() {
        $(this).addClass('pulse');
      }, function() {
        $(this).removeClass('pulse');
    });

    $("#accordion, #accordion1, #accordion2, #accordion3, #accordion4").accordion({
      collapsible: true,
      active: false,
      heightStyle: "content"
    });

    $('#modal').modal();

    if(window.location.hash == '#get_cre') {
      $('html, body').delay(200).animate({ scrollTop: ($("#get_cre").offset().top - 88)}, 500);
    }

	if($.fn.inputmask)
    $("#phone").inputmask("+38 (999) 999-99-99");

    var loyalBlock = $('.loyal');
    var eggGlass = $('.egg_glass');
    var tl = new TimelineLite();

    /*loyalBlock.on('mouseover', function() {
        tl.to(eggGlass, 0.2, {opacity: 0.5, left: 20, scale: 1});
    });

    loyalBlock.on('mouseleave', function() {
        tl.to(eggGlass, 0.2, {opacity: 1, left: 20, scale: 1});
    });*/

});

$(window).load(function(){

    /*var uris = window.location.pathname;
    if(uris !='/'){
      $('#services .col-md-4:eq(0) li').wrapAll('<a href="/#top1"></a>');
      $('#services .col-md-4:eq(1) li').wrapAll('<a href="/#top2"></a>');
    }*/

  var hashi = window.location.hash;
   if(hashi == '#top1') {
      setTimeout(function(){

            var windowWidth = $(window).width();

            if (windowWidth <= 650) {

              $('html, body').delay(200).animate({
                scrollTop: ($("#get_cre").offset().top + 130)
              }, 200);

            } else {

              $('html, body').delay(200).animate({
                scrollTop: ($("#get_cre").offset().top - 73)
              }, 200);

            }

      },100);

      $('.credit_box li').css('visibility','hidden');
      $('.credit_box #ans1').css('visibility','hidden');
       setTimeout(function() {
        var tl = new TimelineLite();
        var ss = $('.credit_box');
       // tl.to(bd1, 1, {opacity:0, autoAlpha:0, delay:1.5})
       // tl.to(bd, 0.2, {autoAlpha:0.7})
        //tl.fromTo(ss, 1, {top:-288, height:0}, {top:'50%', height:288, ease:Power2.easeOut}, '-=0.3')
        tl.staggerFrom(ss.find('li'), 1.6, {autoAlpha:0, scale:1.5, ease:Elastic.easeOut}, 0.2)
        tl.to(ss.find('#ans1'), 1.6, {autoAlpha:1}, 1);
       },1200);


    } else if(hashi == '#top2'){
      setTimeout(function(){
          var windowWidth = $(window).width();
            if (windowWidth <= 650) {

              $('html, body').delay(200).animate({
                scrollTop: ($("#pay_cre").offset().top + 130)
              }, 200);

            } else {

              $('html, body').delay(200).animate({
                scrollTop: ($("#pay_cre").offset().top - 73)
              }, 200);

            }
      },100);

      $('.pay_box li').css('visibility','hidden');
      $('.pay_box #ans2').css('visibility','hidden');

     setTimeout(function() {
        var tl = new TimelineLite();
        var ss = $('.pay_box');
       // tl.to(bd1, 1, {opacity:0, autoAlpha:0, delay:1.5})
       // tl.to(bd, 0.2, {autoAlpha:0.7})
        //tl.fromTo(ss, 1, {top:-288, height:0}, {top:'50%', height:288, ease:Power2.easeOut}, '-=0.3')
        tl.to(ss.find('#ans2'), 0.6, {autoAlpha:1}, 0.1);
        tl.staggerFrom(ss.find('li'), 1.6, {autoAlpha:0, scale:1.5, ease:Elastic.easeOut}, 0.1)

       },1100);


    }

    $('#flexi').animate({
      opacity:1
    })


  $('.flexsliders').flexslider({
    animation: "slide",
    controlNav: true,
    manualControls: ".slide_controlls li",
    directionNav: false,
    pausePlay: false
  });
});

$(function () {
    // /\+\d{2} \(\d{3}\) \d{3}-\d{2}-\d{2}$/
    $('#formReg').submit(function () {
        $('[data-clearifnotmatch]').trigger('keyup');
        phone = $('#formReg input[name="phone"]');
        phone_val = $(phone).val();
	phone_val = phone_val.replace(/[^0-9\+]/g,'');

        pass1 = $('#formReg input[name="password"]').val();
        pass2 = $('#formReg input[name="password2"]').val();
        if (pass1.length < 6 || pass1 !== pass2) {
            $('#formReg input[name="password"]').css({
                backgroundColor: '#FF9999'
            });
            setTimeout(function () {
                $('#formReg input[name="password"]').css({
                    backgroundColor: '#FFFFFF'
                });
            }, 2000);
            $('#formReg input[name="password"]').focus();
            return false;
        }
        if (!/\+380\d{2}\d{3}\d{2}\d{2}$/.test(phone_val)) {
            $(phone).css({
                backgroundColor: '#FF9999'
            });
            setTimeout(function () {
                $(phone).css({
                    backgroundColor: '#F7f7f7'
                });
            }, 2000);
            return false;
        }
	phone.val( phone_val );
        return true;

    })

})
