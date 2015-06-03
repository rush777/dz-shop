var slider = (function(){

    function _setListeners(){
        $('.b-slider__button').on('click', _moveSlide);
    }

    function _setActiveSlide(items) {
        var randMax = items.length - 1,
            rand = 0 + Math.floor(Math.random() * (randMax + 1 - 0));

        items.eq(rand).addClass('active');
        return $(items.eq(rand));
    }

    function _removeActiveClass(item) {
        item.addClass('active').siblings().removeClass('active');
        item.find('.b-slider__description').slideDown();
    }

    function _showSlide(slide, list) {
        var listOffset = list.offset().left,
            slideOffset = slide.offset().left,
            requiredPos = (slideOffset - listOffset) * -1,
            desc = slide.find('.b-slider__description');
        
        _removeActiveClass(slide);
        list.animate({left: requiredPos}, 300);
        desc.slideDown();
    }

    function _initSliders() {

        $('.b-slider').each (function() {
            var activeSlide = _setActiveSlide($(this).find('.b-slider__item')),
                sliderList = $(this).find('.b-slider__list'),
                offset = $(this).find('.b-slider__list').offset().left,
                reqPos = activeSlide.offset().left - offset;
            
            _removeActiveClass(activeSlide);
            sliderList.css('left', '-=' + reqPos + 'px');
        });
    }

    function _moveSlide(e) {
        e.preventDefault();

        var $this = $(this),
            container = $this.closest('.b-slider'),
            list = container.find('.b-slider__list'),
            items = container.find('.b-slider__item'),
            activeSlide = items.filter('.active'),
            nextSlide = activeSlide.next(),
            prevSlide = activeSlide.prev(),
            firstSlide = items.first(),
            lastSlide = items.last(),
            sliderOffset = container.offset().left,
            requiredPos = 0;

        if ($this.hasClass('b-slider__button b-slider__button_next')) {
            if(nextSlide.length) {
                _showSlide(nextSlide, list, sliderOffset);
            } else {
                _showSlide(firstSlide, list, sliderOffset);
            }
        } else {
            if(prevSlide.length) {
                _showSlide(prevSlide, list, sliderOffset);
            } else {
                _showSlide(lastSlide, list, sliderOffset);
            }
        }
    }

    return {
        init: function() {
            _setListeners();
            _initSliders();
        }
    }

}());

$(document).ready(function(){
    if($('.b-slider').length) {
        slider.init();
    }
    
    if($('.b-callback-form__select').length) {
        $('.b-callback-form__select').addClass('dropdown');
    }
});