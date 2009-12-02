(function($){
  var cs  = $('.live-drag');
  var $$  = $.liveDrag= function(){};  
  var st  = ($$.state = {});
  var ev  = ($$.event = {});
  ev.begin= {};
  ev.end  = {};
  ev.start= ev.dropsZone = ev.stop = function(){};
  st.dZone= null;
  st.drops= null;
  st.drop = null;
  st.drag = null;
  st.src  = null;
  st.e    = null;
  st.style= "";
  
  var dragStart = {}; /**********************************/
  dragStart['drag'] = function(){ 
    st.src.addClass('live-drag-active'); 
  };
  dragStart['clone'] = dragStart['sortable'] = function(){ 
    var cl= st.src.clone();
    if(st.src[0].tagName=='LI'){
      cl= $('<div style="'+st.style.join('')+'">'+cl.html()+'</div>');
    }
    cl.addClass('live-drag-active').prependTo("body"); 
  };
  
  dragStart['popup'] = function(){ dragStart.clone();
    st.opacity= st.src.css('opacity');
    st.src.css('opacity',0); 
  };
  
  dragStart['frame'] = function(){ 
    $('body').prepend('<div class="live-drag-active" style="'+st.style.join('')+'"></div>'); 
  };
  
  var dragEnd = {}; /**********************************/
  dragEnd['drag' ] = function(){
    var css=st.drag.offset();
    css['margin-top' ]=0;
    css['margin-left']=0;
    st.src.css(css);
  };
  dragEnd['clone'] = dragEnd['sortable'] = dragEnd['frame'] = function(){};
  dragEnd['popup'] = function(){st.src.css('opacity',st.opacity);};
  
  function exeAtt(ob,el,att){
    var exe = el.attr(att);
    if(exe!="undefined" && typeof ob[exe] == 'function'){
      ob[exe]();
    }
  }
  
  function action(){
      var a= st.src.attr('act'); 
      return a!=null ? a : 'drag';
  }
  
  function chkButton(e){
    var btn= e.button;   
    if($.browser.msie){ 
       btn =(btn == 1 ? 0 : (btn == 4 ? 1 : 2));
    }
    return btn;
  }
  
  cs.live('mousedown',function(e){
    if(chkButton(e)==0 && st.drag==null){
      
      var d= $(this); 
      if (d.hasClass('parent'))d= d.parent();  
      
      var p= d.offset();
      var c= 'width:'+d.width()+'px;height:'+d.height()+'px;padding:';
      c+= d.css('padding-top'   )+
      ' '+d.css('padding-right' )+
      ' '+d.css('padding-bottom')+
      ' '+d.css('padding-left'  )+';top:';
      st.style = [c,p.top,'px;left:',p.left,'px;'];
      st.dZone = null;
      st.src   = d;
      st.e     = e;
      dragStart[action()]();
      st.src.addClass( 'live-drag-source');
      st.drag  = $('div.live-drag-active');
      exeAtt(ev.begin,st.src,'begin');
      ev.start();
      return false;
    }
  });
  
  $(document)
  .bind("mousemove", function(e){
    if(chkButton(e)==0 && st.drag != null ){
       var p = st.drag.offset();
       p.top += (e.pageY - st.e.pageY);
       p.left+= (e.pageX - st.e.pageX);
       if(p.top>0 && p.left>0){ 
         st.drag.css(p);
         st.e= e;
         if(st.dZone==null && st.drops!=null){
            st.dZone=0;
            setTimeout(function(){
              $$.event.dropsZone();  
              st.dZone=null;
            },100);
         }         
         return false;
       }
    }
  })
  .bind("mouseup", function(e){
    if(st.drag != null){ 
       dragEnd[action()]();
       exeAtt(ev.end,st.src,'end');
       st.src.removeClass('live-drag-source');
       if(st.drag[0]==st.src[0]){
         st.drag.removeClass('live-drag-active');} else {
         st.drag.remove(); 
       }
       st.drag = null; 
       $$.event.stop();      
       return false; 
    }  
  });
  
})(jQuery);

(function($){
  var $$ = $.liveDrag
  var ev = $$.event;
  var st = $$.state;

  ev.start = function(){
    var d  = st.src.attr('drop');
    st.drops=(d==null ? null : $(d));
  }

  ev.dropsZone= function(){
    var pY=st.e.pageY;
    var pX=st.e.pageX;
    st.drops.each(function(i){
      var d = $(this);
      var p = d.offset();
      if(pY > p.top  && pY < p.top + d.height() &&
         pX > p.left && pX < p.left+ d.width()){
         d.addClass(   'live-drag-drop');
         st.drop = d;
      } else 
         if(d.hasClass('live-drag-drop')){
         d.removeClass('live-drag-drop');
         st.drop = null;
      }
    })
  }
  
  ev.stop= function(){
    if(st.drops!=null){
      if(st.drops.hasClass(   'live-drag-drop')){
         st.drops.removeClass('live-drag-drop');
      }
    }
  }

  ev.begin["abs"] = function(){
    var src = $.liveDrag.state.src; 
    var drg = $.liveDrag.state.drag; 
    var css = src.offset();
    css['margin-top' ]=0;
    css['margin-left']=0;
    drg.css(css);
  }  
  
})(jQuery);
