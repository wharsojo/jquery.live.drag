/*
 * jQuery.liveDrag 0.6.6 - jQuery plugin to drag & drop DOM element
 *
 * Copyright (c) 2009 
 *   Widi Harsojo (http://wharsojo.wordpress.com)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * $Date: 2009-12-23 $
 */
 
;(function($){
/**
 * Global-Call-Back:
 * - $.liveDrag.event.start   = function(){ event start drag }
 *   default handler already set, you can overwrite it.
 * - $.liveDrag.event.dropZone= function(){ custome dropZone } see *Design-Consideration*
 * - $.liveDrag.event.stop    = function(){ event stop drag  }
 * 
 * onAttribute-Call-Back:(event base on attribute define in source/target dragging)
 * - begin
 *     ex: <div class="live-drag" begin="isDragable"></div>
 *         $.liveDrag.event.begin["isDragable"]= function(){ test; return true;}
 * - zone
 *     ex: <div class="live-drag" zone="sortable"></div>
 *         *sortable* defined in this file
 *
 * - end
 *     ex: <div class="droper" end="isDropable"></div>
 *         $.liveDrag.event.end["isDropable"]= function(){ test; return true;}
 *
 * Design-Consideration
 * - Default-Event need defined in namespaces of widget (ex: $.liveDrag._dropZone)
 * - Drop functionality can be activate by adding attribute drop target (jquery selector)
 *   if no drop-attribute, mean that performing checkZone with no action 
 * - If you have faster algoritm for testing dropZone you can attach your event in
 *   $.liveDrag.event.dropZone = function(){}
 */
  var cs  = $('.live-drag');
  var $$  = $.liveDrag= function(){};  
  var st  = ($$.state = {});
  var ev  = ($$.event = {});
  ev.start= ev.stop = function(){};  /* Global-Call-Back */
  ev.begin= {}; /* array event for onAttribute-Call-Back */
  ev.zone = {}; /* array event for onAttribute-Call-Back */
  ev.end  = {}; /* array event for onAttribute-Call-Back */
  ev.dropZone = null; /* internal use */
  
  ( $$.nilState = function(){
    st.style= "";   /* internal use */
    st.e    = null; /* event object */
    st.src  = null; /* source dragging - jquery object */
    st.drag = null; /* source dragging - jquery object */
    st.drop = null; /* droparea selected - DOM object */
    st.drops= null; /* dropsarea - jquery object */
    st.dZone= null; /* internal use */
  })();
  
  var dragStart = {}; /**********************************/
  dragStart['drag'] = function(){ 
    st.src.addClass('live-drag-active'); 
  };
  dragStart['clone'] = dragStart['sortable'] = function(){ 
    var cl= st.src.clone();
    if(st.src[0].tagName=='LI' || st.src[0].tagName=='TD' ){
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
  
  function attUp(elm,att){
    var a= elm.attr(att); 
    if (a==null){
        a= elm.parent().attr(att); 
    }
    return a;
  }
  
  function action(){
      var a= attUp(st.src, 'act');
      return a!=null ? a : 'drag';
  }
  
  function chkButton(e){
    var btn= e.button;   
    if($.browser.msie){ 
       btn =(btn == 1 ? 0 : (btn == 4 ? 1 : 2));
    }
    return btn;
  }
  
  $$.exeAtt = function(ob,el,att){
    var rtn = true;
    var exe = attUp(el,att);
    if (exe!= null && typeof ob[exe] == 'function'){
      rtn = ob[exe]();
    }
    return (rtn!=null ? rtn : true )
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
      if($$.exeAtt(ev.begin,st.src,'begin')){
        var d = attUp(st.src,'drop');
        if (d == null){
          st.drops=null;
          $$.dropZone = function(){}; } else {
          $$.dropZone = (ev.dropZone!=null ? ev.dropZone : $$._dropZone);
          st.drops=$(d);
        }
        ev.start();
      }
      return false;
    }
  });
  
  checkZone = function(){
    $$.dropZone();  
    st.dZone=null;
  }
  
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
            setTimeout(checkZone,100);
         }         
         return false;
       }
    }
  })
  .bind("mouseup", function(e){
    if(st.drag != null){ 
       dragEnd[action()]();
       st.src.removeClass('live-drag-source');
       if(st.drag[0]==st.src[0]){
         st.drag.removeClass('live-drag-active');} else {
         st.drag.remove(); 
       }
       if($$.exeAtt(ev.end,$(st.drop),'end')){
          $$.event.stop();
       }
       $$.nilState();
       return false; 
    }  
  });
  
  $$._dropZone = function(){
    var pY=st.e.pageY;
    var pX=st.e.pageX;
    var dropzone= null;
    st.drops.each(function(i){
      var d = $(this);
      var p = d.offset();
      if(pY > p.top  && pY < p.top + d.height() &&
         pX > p.left && pX < p.left+ d.width()){
         d.addClass(   'live-drag-drop');
         dropzone= this;
      } else 
         if(d.hasClass('live-drag-drop')){
         d.removeClass('live-drag-drop');
      }
    });
    if(dropzone==null){
      st.drop  = null;
    } else {
      if(st.drop!=dropzone){
         st.drop =dropzone;
         $$.exeAtt(ev.zone,$(st.drop),'zone');
      }
    }
  }

  ev.stop= function(){
    if(st.drops!=null){
      if(st.drops.hasClass(   'live-drag-drop')){
         st.drops.removeClass('live-drag-drop');
      }
    }
  }
  
  ev.begin["abs"] = function(){
    var css = st.src.offset();
    css['margin-top' ]=0;
    css['margin-left']=0;
    st.drag.css(css);
  }  
  
  ev.zone["sortable"] = function(){
    var dp= $(st.drop);
    var ls= dp.parent().find('>*');
    var cl= st.src.clone();
    var sr= ls.index(st.src);
    var tg= ls.index(dp);
    if(sr>tg || sr==-1){
      dp.before(cl);} else {
      dp.after( cl);
    }
    st.src.remove();
    st.src= cl;
  }
  
  ev.zone["sortable-td"] = function(){
    if(st.drop!=st.src[0]){
      var dp= $(st.drop);
      var ls= st.drops; 
      var cl= st.src.clone();
      var sr= ls.index(st.src);
      var tg= ls.index(dp);
      var v1= v2= 0;
      var a = b = null;
      if(sr<tg){
        v1= sr;v2= tg;
        for(i=v1;i<v2;i++){
          a = ls[i]; b = ls[i+1].cloneNode(true);
          a.parentNode.replaceChild(b, a);
        }
        a = ls[v2];  b = ls[v1];
        a.parentNode.replaceChild(b, a);
      } else {
        v1= tg;v2= sr; 
        for(i=v2;i>v1;i--){
          a = ls[i]; b = ls[i-1].cloneNode(true);
          a.parentNode.replaceChild(b, a);
        }
        a = ls[v1];  b = ls[v2];
        a.parentNode.replaceChild(b, a);
      }
      var d = attUp(st.src,'drop');
      st.drops=$(d);
    }
  }  

})(jQuery);
//alert(123);