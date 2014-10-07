'use strict';

angular.module('ds.products')
    /** Controls the product detail view, which allows the shopper to add an item to the cart.
     * Listens to the 'cart:updated' event.  Once the item has been added to the cart, and the updated
     * cart information has been retrieved from the service, the 'cart' view will be shown.
     */
    .controller('ProductDetailCtrl', ['$scope', '$rootScope', 'CartSvc', 'product', 'settings', 'GlobalData', 'PriceSvc',
        function($scope, $rootScope, CartSvc, product, settings, GlobalData, PriceSvc) {


            $scope.product = product;
            $scope.currencySymbol = GlobalData.getCurrencySymbol();

            if(!$scope.product.images || !$scope.product.images.length) { // set default image if no images configured
                $scope.product.images = [{url: settings.placeholderImage}];
            }

            //input default values must be defined in controller, not html, if tied to ng-model
            $scope.productDetailQty = 1;
            $scope.buyButtonEnabled = true;


            // scroll to top on load
            window.scrollTo(0, 0);

            var unbind = $rootScope.$on('cart:updated', function () {
                $scope.buyButtonEnabled = true;
                getPriceForStoreCurrency();
            });

            $scope.$on('$destroy', unbind);

            /** Add the product to the cart.  'Buy' button is disabled while cart update is in progress. */
            $scope.addToCartFromDetailPage = function () {
                $scope.buyButtonEnabled = false;
                CartSvc.addProductToCart(product, $scope.productDetailQty);
            };

            /*
             TODO
             because the product detail service only returns the default price right now,
             we need to get all prices for this product for currency switching purposes
             */
            var getPriceForStoreCurrency = function () {
                var foundPrice = false;
                var query = {
                    q: 'productId:(' + product.id + ')'
                };
                PriceSvc.query(query).then(function (result) {
                    angular.forEach(result, function (price) {
                        if (price.currency === GlobalData.storeCurrency) {
                            foundPrice = true;
                            product.price = price;
                        }
                    });
                    /*
                     need to disable buy button if no price is available
                     */
                    if (!foundPrice) {
                        $scope.buyButtonEnabled = false;
                    }
                });
            };

            getPriceForStoreCurrency();

}]);