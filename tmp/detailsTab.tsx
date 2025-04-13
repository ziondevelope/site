                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <PropertyFeatures
                          features={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    />