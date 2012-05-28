lib_coffee += $(wildcard src/lib/*._coffee)
vendor_js += $(wildcard vendor/*.js)

sources = $(lib_coffee) $(lib_js)

lib_targets += $(lib_coffee:src/%._coffee=%.js)
vendor_targets += $(vendor_js:vendor/%.js=lib/%.js)

all: $(lib_targets) $(vendor_targets)
	@echo > /dev/null

watch: all
	@inotifywait -q -m -e close_write $(sources) | while read line; do make --no-print-directory all; done;

$(vendor_targets): lib/%.js: vendor/%.js
	@mkdir -p lib
	cp $< $@

$(lib_targets): lib/%.js: src/lib/%._coffee
	@mkdir -p lib
	_coffee -c $<
	@test -e $(basename $<).js || (echo '_coffee failed' && exit 1)
	@mv $(basename $<).js $@
	@touch $@

publish:
	find . -name .AppleDobule | xargs rm -rf 
	find . -name .DS_Store | xargs rm -rf 
	npm publish

clean:
	rm -rf lib

.PHONY: clean all watch
