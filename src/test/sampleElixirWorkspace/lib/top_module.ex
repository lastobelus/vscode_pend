defmodule TopModule do
  def first_top_function(a, b) when is_atom(a) do
    IO.puts("a: #{inspect a}")
  end

  defmodule InnerModule do
    def first_inner_function(arg) do
      IO.puts("arg: #{inspect arg}")

      # undefined_function(:one, first_top_function(:a, "b"))

      # first_top_function(undefined_function_two(:a, "(b)"), "(stuff)")
    end

    def second_inner_function(arg) do
      IO.puts("arg: #{inspect arg}")
    end

    def last_inner_function(arg) do
      IO.puts("arg: #{inspect arg}")
    end
  end

  def last_top_function(arg) do
    IO.puts("arg: #{inspect arg}")
  end
end
